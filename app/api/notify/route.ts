import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

function getSettings(): Record<string, string> {
  try {
    const file = path.join(process.cwd(), "scripts", "site-settings.json");
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {}
  return {};
}

export async function POST(req: NextRequest) {
  try {
    const { message, phone, website } = await req.json();
    const s = getSettings();
    const botToken = s.telegramBotToken?.trim();
    const chatId   = s.telegramChatId?.trim();

    if (botToken && chatId) {
      const text =
        `📩 *নতুন মেসেজ — Code Craft BD*\n\n` +
        `💬 *বার্তা:* ${message}\n` +
        `📱 *নম্বর:* +${phone}\n` +
        `🌐 *ওয়েবসাইট:* ${website}`;

      await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "Markdown",
          }),
        }
      );
    }

    // Always return success — never expose backend errors to the user
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

// GET — helper to find the right chat_id from the bot's recent updates
export async function GET() {
  try {
    const s = getSettings();
    const botToken = s.telegramBotToken?.trim();
    if (!botToken) return NextResponse.json({ ok: false, error: "No bot token configured" }, { status: 400 });

    const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
    const data = await res.json() as { ok: boolean; result?: Array<{ message?: { chat?: { id: number; type: string; title?: string; first_name?: string } } }> };

    if (!data.ok) return NextResponse.json({ ok: false, error: "Telegram API error" }, { status: 400 });

    // Extract unique chats from updates
    const chats = new Map<number, { id: number; type: string; name: string }>();
    (data.result || []).forEach((update) => {
      const chat = update.message?.chat;
      if (chat) {
        chats.set(chat.id, {
          id: chat.id,
          type: chat.type,
          name: chat.title || chat.first_name || String(chat.id),
        });
      }
    });

    return NextResponse.json({ ok: true, chats: Array.from(chats.values()) });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to reach Telegram" }, { status: 500 });
  }
}
