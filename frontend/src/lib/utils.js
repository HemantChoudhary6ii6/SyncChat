export function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

export function formatDateSeparator(date) {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a, b) =>
        a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

    if (isSameDay(d, today)) return "Today";
    if (isSameDay(d, yesterday)) return "Yesterday";

    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function formatLastMessagePreview(conversation) {
    if (!conversation?.lastMessage?.text) return "No messages yet";
    const text = conversation.lastMessage.text;
    return text.length > 32 ? text.slice(0, 32) + "…" : text;
}