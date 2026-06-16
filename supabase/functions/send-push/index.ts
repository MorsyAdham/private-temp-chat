import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push";

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

webpush.setVapidDetails("mailto:adhammorsy2311@gmail.com", VAPID_PUBLIC, VAPID_PRIVATE);

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

    try {
        const { to_email, title, body } = await req.json();
        if (!to_email || !title) {
            return new Response(JSON.stringify({ error: "Missing fields" }), {
                status: 400, headers: { ...CORS, "Content-Type": "application/json" }
            });
        }

        const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        const { data, error } = await db
            .from("push_subscriptions")
            .select("subscription")
            .eq("user_email", to_email)
            .maybeSingle();

        if (error || !data?.subscription) {
            return new Response(JSON.stringify({ error: "No subscription found" }), {
                status: 404, headers: { ...CORS, "Content-Type": "application/json" }
            });
        }

        const sub = typeof data.subscription === "string"
            ? JSON.parse(data.subscription)
            : data.subscription;

        await webpush.sendNotification(sub, JSON.stringify({ title, body }));

        return new Response(JSON.stringify({ ok: true }), {
            headers: { ...CORS, "Content-Type": "application/json" }
        });
    } catch (err) {
        console.error("send-push error:", err);
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500, headers: { ...CORS, "Content-Type": "application/json" }
        });
    }
});
