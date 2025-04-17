
// A collection of consistent background colors for user avatars
const avatarColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-cyan-500",
];

/**
 * Generates a consistent color based on a string input (like a name or email)
 * This ensures the same user always gets the same color
 */
export function getRandomColor(str: string): string {
  // Create a simple hash from the string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use the hash to pick a color from our palette
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
}
