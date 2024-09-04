export function parseDateTime(dateString) {

  // Check if the string matches the original format "yyyyMMddHHmm"
  if (/^\d{14}$/.test(dateString)) {

    try {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      const hours = dateString.substring(8, 10);
      const minutes = dateString.substring(10, 12);

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error("Error parsing original format:", error);
      return "Invalid Date";
    }
  } else {
    
    // Assume the string matches the new format "yyyy-MM-dd HH:mm:ss"
    try {
      const [datePart, timePart] = dateString.split(" ");
      const [year, month, day] = datePart.split("-");
      const [hours, minutes] = timePart.split(":");

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error("Error parsing new format:", error);
      return "Invalid Date";
    }
  }
}

export function parseArticleBody(articleBodyString) {
  // Replace all single quotes with double quotes
  //const formattedString = articleBodyString.replace(/'/g, '"');
  // Split the article body into sections based on the "##" separator

  const sections = articleBodyString.split("##");

  // Remove the empty sections and trim whitespace from each section
  const parsedSections = sections
    .filter((section) => section.trim() !== "")
    .map((section) => section.trim());

  return parsedSections;
}

export function parseFullArticleBody(articleBodyString) {
  // Replace all single quotes with double quotes
  const formattedString = articleBodyString.replace(/'/g, '"');
  // Split the article body into sections based on the "##" separator

  const sections = articleBodyString.split("##");

  // Remove the empty sections and trim whitespace from each section
  const parsedSections = sections
    .filter((section) => section.trim() !== "")
    .map((section) => section.trim());

  return parsedSections;
}
