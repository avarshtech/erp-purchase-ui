/**
 * Username Generator Utility
 * Generates a unique username from first name and last name
 */

/**
 * Generate a unique username from firstName and lastName
 * Logic: first letter of firstName + full lastName (lowercase) + random 3-digit number
 * Example: "John" + "Doe" -> "jdoe123"
 * 
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @returns {string} Unique username
 */
export const generateUsername = (firstName, lastName) => {
  if (!firstName || !lastName) {
    throw new Error("First name and last name are required");
  }

  // Clean and normalize the names
  const cleanFirstName = firstName.trim().toLowerCase().replace(/\s+/g, '');
  const cleanLastName = lastName.trim().toLowerCase().replace(/\s+/g, '');

  // Get first letter of first name
  const firstInitial = cleanFirstName.charAt(0);

  // Generate random 3-digit number for uniqueness
  const randomSuffix = Math.floor(100 + Math.random() * 900);

  // Construct username: firstInitial + lastName + randomNumber
  const username = `${firstInitial}${cleanLastName}${randomSuffix}`;

  return username;
};

export default generateUsername;
