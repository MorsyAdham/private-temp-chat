import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID")!;
const ALLOWED_EMAILS = ["adhammorsy2311@gmail.com", "ayaessam487@gmail.com", "joboffers540@gmail.com"];

function escapeHtml(s: string) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

    try {
        const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // Verify the caller is an authenticated, allowed user before sending anything.
        const authHeader = req.headers.get("Authorization") || "";
        const jwt = authHeader.replace(/^Bearer\s+/i, "");
        if (!jwt) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401, headers: { ...CORS, "Content-Type": "application/json" }
            });
        }
        const { data: callerData, error: callerError } = await db.auth.getUser(jwt);
        const callerEmail = callerData?.user?.email;
        if (callerError || !callerEmail || !ALLOWED_EMAILS.includes(callerEmail)) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401, headers: { ...CORS, "Content-Type": "application/json" }
            });
        }

        const { title, body } = await req.json();
        if (!title) {
            return new Response(JSON.stringify({ error: "Missing fields" }), {
                status: 400, headers: { ...CORS, "Content-Type": "application/json" }
            });
        }

        const text = body ? `<b>${escapeHtml(String(title))}</b>\n${escapeHtml(String(body))}` : escapeHtml(String(title));

        const tgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: "HTML" })
        });

        if (!tgResponse.ok) {
            const errText = await tgResponse.text();
            return new Response(JSON.stringify({ error: `Telegram error: ${errText}` }), {
                status: 502, headers: { ...CORS, "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ ok: true }), {
            headers: { ...CORS, "Content-Type": "application/json" }
        });
    } catch (err) {
        console.error("send-telegram error:", err);
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500, headers: { ...CORS, "Content-Type": "application/json" }
        });
    }
});
