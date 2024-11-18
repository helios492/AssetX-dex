import { initialPoolInfoType } from "./type";

const handleArrangeByName = (
  array: initialPoolInfoType[],
  sortBy: string,
  sortDirection: string
): initialPoolInfoType[] => {
  if (!Array.isArray(array)) {
    console.error("handleArrangeByName called with invalid argument:", array);
    return [];
  }
  // Uses a single sort function for both ascending and descending order.
  // Determines the sort order based on the sortDirection parameter.
  const sortOrder = sortDirection === "down" ? -1 : 1; 
  
  // Creates a shallow copy of the array before sorting to avoid mutating the original array.
  return [...array].sort((a, b) => 
    sortOrder * a.tokenA.toLowerCase().localeCompare(b.tokenA.toLowerCase()) // Uses the localeCompare method for string comparison, which handles alphabetical sorting well.
  );
};

export default handleArrangeByName;