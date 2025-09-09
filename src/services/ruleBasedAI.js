export async function classifyLog(log) {
  if (log.level === "error" && log.message.toLowerCase().includes("critical")) {
    return { status: "critical", ai_label: "system_failure", ai_hint: "Immediate attention required" };
  }
  return { status: "classified", ai_label: "general_issue", ai_hint: "Review when possible" };
}
