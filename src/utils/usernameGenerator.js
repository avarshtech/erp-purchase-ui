/**
 * Username Generator Utility
 * Generates a unique username from first name (person's name) and last name (father's name)
 */

/**
 * Generate a unique username from firstName and lastName
 * Logic: full firstName (person's name) + first letter of lastName (father's name initial) + random 3-digit number
 * Example: "John" + "Doe" (father) -> "johnd123"
 * 
 * @param {string} firstName - User's first name (person's name)
 * @param {string} lastName - User's last name (father's name)
 * @returns {string} Unique username
 */
export const generateUsername = (firstName, lastName) => {
  if (!firstName || !lastName) {
    throw new Error("First name and last name are required");
  }

  // Clean and normalize the names
  const cleanFirstName = firstName.trim().toLowerCase().replace(/\s+/g, '');
  const cleanLastName = lastName.trim().toLowerCase().replace(/\s+/g, '');

  // Get first letter of last name (father's initial)
  const fatherInitial = cleanLastName.charAt(0);

  // Generate random 3-digit number for uniqueness
  const randomSuffix = Math.floor(100 + Math.random() * 900);

  // Construct username: firstName + fatherInitial + randomNumber
  const username = `${cleanFirstName}${fatherInitial}${randomSuffix}`;

  return username;
};

export default generateUsername;
