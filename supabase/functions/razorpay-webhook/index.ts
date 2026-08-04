// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "whsec_test_secret_12345";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // Optional signature verification check
    if (!signature) {
      console.warn("Razorpay webhook signature missing");
    }

    const payload = JSON.parse(body);

    if (payload.event === "payment.captured" || payload.event === "order.paid") {
      const paymentEntity = payload.payload.payment.entity;
      const membershipId = paymentEntity.notes?.membership_id;
      const paymentId = paymentEntity.id;
      const amount = paymentEntity.amount / 100; // Convert from paise

      if (!membershipId) {
        return new Response(JSON.stringify({ error: "membership_id missing in order notes" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Invoke Supabase Database RPC Procedure to record payment & ledger entry
      const { data, error } = await supabase.rpc("process_member_payment", {
        p_membership_id: membershipId,
        p_transaction_ref: paymentId,
        p_payment_method: "razorpay",
        p_admin_id: null,
        p_notes: "Automated payment confirmed via Razorpay webhook",
      });

      if (error) {
        console.error("Database RPC error executing process_member_payment:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Razorpay payment webhook processed successfully",
          result: data,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true, eventIgnored: payload.event }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook processing exception:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
