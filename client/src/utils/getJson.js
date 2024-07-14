export function getJson(message) {
  const jsonPattern = /```json\n([\s\S]*?)\n```/g; // Pattern to match JSON blocks
  const jsonData = [];

  let match;
  while ((match = jsonPattern.exec(message)) !== null) {
    try {
      console.log("Extracted JSON block:", match[1]);
      const parsedData = JSON.parse(match[1]);
      console.log("Parsed JSON data:", parsedData);
      jsonData.push(...parsedData);
    } catch (error) {
      console.error("Error parsing JSON data:", error);
    }
  }

  console.log("Final parsed JSON array:", jsonData);
  return jsonData;
}
