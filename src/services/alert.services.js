export async function sendAlert(log) {
  console.log(" ALERT TRIGGERED");
  console.log(`Level: ${log.level}`);
  console.log(`Message: ${log.message}`);
}
