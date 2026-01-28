// University name to ID mapping for AI Counsellor shortlisting
// This maps AI-generated university names to actual database IDs

export const UNIVERSITY_NAME_TO_ID = {
  // Dream Universities
  "Stanford University": "6979264b061b38d8d1d18227",
  "MIT": "6979264b061b38d8d1d18228", 
  "Harvard University": "6979264b061b38d8d1d18229",
  "University of Cambridge": "6979264b061b38d8d1d1822a",
  "University of Oxford": "6979264b061b38d8d1d1822b",
  "UC Berkeley": "6979264b061b38d8d1d1822c",
  "Carnegie Mellon University": "6979264b061b38d8d1d18228",
  "ETH Zurich": "6979264b061b38d8d1d1822d",
  "Imperial College London": "6979264b061b38d8d1d1822e",
  
  // Target Universities  
  "University of Toronto": "6979264b061b38d8d1d1822f",
  "National University of Singapore": "6979264b061b38d8d1d18230",
  "National University of Singapore (NUS)": "6979264b061b38d8d1d18230",
  "University of Melbourne": "6979264b061b38d8d1d18231",
  "University of British Columbia": "6979264b061b38d8d1d18232",
  "University of British Columbia (UBC)": "6979264b061b38d8d1d18232",
  "EPFL (Swiss Federal Institute of Technology)": "6979264b061b38d8d1d18233",
  "IIT Delhi (International Collaborations)": "6979264b061b38d8d1d18234",
  "University of Michigan": "6979264b061b38d8d1d18235",
  "Georgia Institute of Technology": "6979264b061b38d8d1d18236",
  "University of Illinois Urbana-Champaign": "6979264b061b38d8d1d18231",
  "University of Illinois at Urbana-Champaign": "6979264b061b38d8d1d18231",
  "McGill University": "6979264b061b38d8d1d18237",
  "University of Waterloo": "6979264b061b38d8d1d18238",
  "Technische Universität München": "6979264b061b38d8d1d18239",
  "University of New South Wales (UNSW)": "6979264b061b38d8d1d1823a",
  "University of California San Diego (UCSD)": "6979264b061b38d8d1d1823b",
  "University of Hong Kong": "6979264b061b38d8d1d1823c",
  "University of Tokyo": "6979264b061b38d8d1d1823d",
  
  // Safe Universities
  "University of Waikato": "6979264b061b38d8d1d1823e",
  "University of Manitoba": "6979264b061b38d8d1d1823f",
  "Dublin City University": "6979264b061b38d8d1d18240",
  "University of Limerick": "6979264b061b38d8d1d18241",
  "RMIT University": "6979264b061b38d8d1d18242",
  "Coventry University": "6979264b061b38d8d1d18243",
  "University of Amsterdam": "6979264b061b38d8d1d18244",
  "University of Wisconsin-Madison": "6979264b061b38d8d1d18245",
  "Seoul National University": "6979264b061b38d8d1d18246",
  "University of Copenhagen": "6979264b061b38d8d1d18247",
  "University of Manchester": "6979264b061b38d8d1d18248",
  "University of Delaware": "6979264b061b38d8d1d18249"
};

// Function to get university ID by name with flexible matching
export const getUniversityIdByName = (universityName) => {
  // Try exact match first
  if (UNIVERSITY_NAME_TO_ID[universityName]) {
    return UNIVERSITY_NAME_TO_ID[universityName];
  }
  
  // Try partial matching (case-insensitive)
  const normalizedName = universityName.toLowerCase();
  for (const [name, id] of Object.entries(UNIVERSITY_NAME_TO_ID)) {
    if (name.toLowerCase().includes(normalizedName) || normalizedName.includes(name.toLowerCase())) {
      return id;
    }
  }
  
  return null;
};
