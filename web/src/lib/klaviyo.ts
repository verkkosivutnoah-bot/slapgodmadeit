/**
 * Klaviyo (server-only). Two calls per signup:
 *  1. upsert the profile with our own properties (source, consent record, signed download URL)
 *  2. subscribe it to the list — the list uses single opt-in, so the profile is SUBSCRIBED
 *     immediately and the welcome flow fires right away. Consent proof lives on the profile
 *     (sg_consent_text / sg_consent_at / sg_consent_ip) since there is no confirmation click.
 *
 * Env: KLAVIYO_PRIVATE_KEY (pk_...), KLAVIYO_LIST_ID, optional KLAVIYO_REVISION.
 * Without a key configured, `subscribe()` reports `skipped` so local dev still works.
 */
const API = "https://a.klaviyo.com/api";
const REVISION = process.env.KLAVIYO_REVISION || "2024-10-15";

export interface SubscribeInput {
  email: string;
  source: string;
  consentText: string;
  consentAt: string;
  consentIp?: string;
  downloadUrl?: string;
}

export type SubscribeResult = { status: "ok" } | { status: "skipped" } | { status: "error"; message: string };

function headers() {
  return {
    Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`,
    "Content-Type": "application/json",
    accept: "application/json",
    revision: REVISION,
  };
}

async function call(path: string, body: unknown): Promise<{ ok: true } | { ok: false; message: string }> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { method: "POST", headers: headers(), body: JSON.stringify(body) });
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "network error" };
  }
  if (res.ok || res.status === 202) return { ok: true };
  const detail = await res.text().catch(() => "");
  return { ok: false, message: `${res.status} ${detail.slice(0, 300)}` };
}

export function klaviyoConfigured() {
  return Boolean(process.env.KLAVIYO_PRIVATE_KEY && process.env.KLAVIYO_LIST_ID);
}

/** Create or update a profile with our own sg_* properties. */
export async function upsertProfile(email: string, properties: Record<string, unknown>): Promise<SubscribeResult> {
  if (!klaviyoConfigured()) return { status: "skipped" };
  const r = await call("/profile-import/", {
    data: { type: "profile", attributes: { email, properties } },
  });
  return r.ok ? { status: "ok" } : { status: "error", message: r.message };
}

/** Record a custom event (e.g. "Contact Request") you can build Klaviyo flows on. */
export async function track(
  metric: string,
  email: string,
  properties: Record<string, unknown>
): Promise<SubscribeResult> {
  if (!klaviyoConfigured()) return { status: "skipped" };
  const r = await call("/events/", {
    data: {
      type: "event",
      attributes: {
        properties,
        metric: { data: { type: "metric", attributes: { name: metric } } },
        profile: { data: { type: "profile", attributes: { email } } },
      },
    },
  });
  return r.ok ? { status: "ok" } : { status: "error", message: r.message };
}

export async function subscribe({ email, source, consentText, consentAt, consentIp, downloadUrl }: SubscribeInput): Promise<SubscribeResult> {
  if (!klaviyoConfigured()) return { status: "skipped" };

  // 1. profile upsert — our own record of what they agreed to, plus the gated download link
  const profile = await call("/profile-import/", {
    data: {
      type: "profile",
      attributes: {
        email,
        properties: {
          sg_source: source,
          sg_consent_text: consentText,
          sg_consent_at: consentAt,
          ...(consentIp ? { sg_consent_ip: consentIp } : {}),
          ...(downloadUrl ? { sg_free_kit_url: downloadUrl } : {}),
        },
      },
    },
  });
  if (!profile.ok) return { status: "error", message: profile.message };

  // 2. list subscription — list is single opt-in, so this subscribes them straight away
  const sub = await call("/profile-subscription-bulk-create-jobs/", {
    data: {
      type: "profile-subscription-bulk-create-job",
      attributes: {
        custom_source: source,
        profiles: {
          data: [
            {
              type: "profile",
              attributes: {
                email,
                subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
              },
            },
          ],
        },
      },
      relationships: { list: { data: { type: "list", id: process.env.KLAVIYO_LIST_ID } } },
    },
  });
  if (!sub.ok) return { status: "error", message: sub.message };

  return { status: "ok" };
}
