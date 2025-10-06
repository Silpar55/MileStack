import { NextRequest, NextResponse } from "next/server";

// Mock institution database
const institutions = [
  {
    id: "1",
    name: "Stanford University",
    location: "Stanford, CA",
    type: "University",
  },
  {
    id: "2",
    name: "Massachusetts Institute of Technology",
    location: "Cambridge, MA",
    type: "University",
  },
  {
    id: "3",
    name: "Harvard University",
    location: "Cambridge, MA",
    type: "University",
  },
  {
    id: "4",
    name: "University of California, Berkeley",
    location: "Berkeley, CA",
    type: "University",
  },
  {
    id: "5",
    name: "Carnegie Mellon University",
    location: "Pittsburgh, PA",
    type: "University",
  },
  {
    id: "6",
    name: "University of Washington",
    location: "Seattle, WA",
    type: "University",
  },
  {
    id: "7",
    name: "Georgia Institute of Technology",
    location: "Atlanta, GA",
    type: "University",
  },
  {
    id: "8",
    name: "University of Illinois at Urbana-Champaign",
    location: "Urbana, IL",
    type: "University",
  },
  {
    id: "9",
    name: "University of Texas at Austin",
    location: "Austin, TX",
    type: "University",
  },
  {
    id: "10",
    name: "University of Michigan",
    location: "Ann Arbor, MI",
    type: "University",
  },
  {
    id: "11",
    name: "Cornell University",
    location: "Ithaca, NY",
    type: "University",
  },
  {
    id: "12",
    name: "Princeton University",
    location: "Princeton, NJ",
    type: "University",
  },
  {
    id: "13",
    name: "Yale University",
    location: "New Haven, CT",
    type: "University",
  },
  {
    id: "14",
    name: "Columbia University",
    location: "New York, NY",
    type: "University",
  },
  {
    id: "15",
    name: "University of Pennsylvania",
    location: "Philadelphia, PA",
    type: "University",
  },
  {
    id: "16",
    name: "Duke University",
    location: "Durham, NC",
    type: "University",
  },
  {
    id: "17",
    name: "Northwestern University",
    location: "Evanston, IL",
    type: "University",
  },
  {
    id: "18",
    name: "University of Chicago",
    location: "Chicago, IL",
    type: "University",
  },
  {
    id: "19",
    name: "Johns Hopkins University",
    location: "Baltimore, MD",
    type: "University",
  },
  {
    id: "20",
    name: "Rice University",
    location: "Houston, TX",
    type: "University",
  },
  {
    id: "21",
    name: "Vanderbilt University",
    location: "Nashville, TN",
    type: "University",
  },
  {
    id: "22",
    name: "Washington University in St. Louis",
    location: "St. Louis, MO",
    type: "University",
  },
  {
    id: "23",
    name: "Emory University",
    location: "Atlanta, GA",
    type: "University",
  },
  {
    id: "24",
    name: "Georgetown University",
    location: "Washington, DC",
    type: "University",
  },
  {
    id: "25",
    name: "University of Notre Dame",
    location: "Notre Dame, IN",
    type: "University",
  },
  {
    id: "26",
    name: "University of Virginia",
    location: "Charlottesville, VA",
    type: "University",
  },
  {
    id: "27",
    name: "Wake Forest University",
    location: "Winston-Salem, NC",
    type: "University",
  },
  {
    id: "28",
    name: "Tufts University",
    location: "Medford, MA",
    type: "University",
  },
  {
    id: "29",
    name: "University of North Carolina at Chapel Hill",
    location: "Chapel Hill, NC",
    type: "University",
  },
  {
    id: "30",
    name: "Boston College",
    location: "Chestnut Hill, MA",
    type: "University",
  },
  {
    id: "31",
    name: "New York University",
    location: "New York, NY",
    type: "University",
  },
  {
    id: "32",
    name: "University of Southern California",
    location: "Los Angeles, CA",
    type: "University",
  },
  {
    id: "33",
    name: "University of California, Los Angeles",
    location: "Los Angeles, CA",
    type: "University",
  },
  {
    id: "34",
    name: "University of California, San Diego",
    location: "San Diego, CA",
    type: "University",
  },
  {
    id: "35",
    name: "University of California, Irvine",
    location: "Irvine, CA",
    type: "University",
  },
  {
    id: "36",
    name: "University of California, Davis",
    location: "Davis, CA",
    type: "University",
  },
  {
    id: "37",
    name: "University of California, Santa Barbara",
    location: "Santa Barbara, CA",
    type: "University",
  },
  {
    id: "38",
    name: "University of California, Santa Cruz",
    location: "Santa Cruz, CA",
    type: "University",
  },
  {
    id: "39",
    name: "University of California, Riverside",
    location: "Riverside, CA",
    type: "University",
  },
  {
    id: "40",
    name: "University of California, Merced",
    location: "Merced, CA",
    type: "University",
  },
  {
    id: "41",
    name: "California Institute of Technology",
    location: "Pasadena, CA",
    type: "University",
  },
  {
    id: "42",
    name: "University of California, San Francisco",
    location: "San Francisco, CA",
    type: "University",
  },
  {
    id: "43",
    name: "University of California, Hastings",
    location: "San Francisco, CA",
    type: "University",
  },
  {
    id: "44",
    name: "University of California, Berkeley Extension",
    location: "Berkeley, CA",
    type: "University",
  },
  {
    id: "45",
    name: "University of California, Los Angeles Extension",
    location: "Los Angeles, CA",
    type: "University",
  },
  {
    id: "46",
    name: "University of California, San Diego Extension",
    location: "San Diego, CA",
    type: "University",
  },
  {
    id: "47",
    name: "University of California, Irvine Extension",
    location: "Irvine, CA",
    type: "University",
  },
  {
    id: "48",
    name: "University of California, Davis Extension",
    location: "Davis, CA",
    type: "University",
  },
  {
    id: "49",
    name: "University of California, Santa Barbara Extension",
    location: "Santa Barbara, CA",
    type: "University",
  },
  {
    id: "50",
    name: "University of California, Santa Cruz Extension",
    location: "Santa Cruz, CA",
    type: "University",
  },
  {
    id: "51",
    name: "University of California, Riverside Extension",
    location: "Riverside, CA",
    type: "University",
  },
  {
    id: "52",
    name: "University of California, Merced Extension",
    location: "Merced, CA",
    type: "University",
  },
  {
    id: "53",
    name: "University of California, Hastings Extension",
    location: "San Francisco, CA",
    type: "University",
  },
  {
    id: "54",
    name: "University of California, San Francisco Extension",
    location: "San Francisco, CA",
    type: "University",
  },
  {
    id: "55",
    name: "University of California, Berkeley Summer Sessions",
    location: "Berkeley, CA",
    type: "University",
  },
  {
    id: "56",
    name: "University of California, Los Angeles Summer Sessions",
    location: "Los Angeles, CA",
    type: "University",
  },
  {
    id: "57",
    name: "University of California, San Diego Summer Sessions",
    location: "San Diego, CA",
    type: "University",
  },
  {
    id: "58",
    name: "University of California, Irvine Summer Sessions",
    location: "Irvine, CA",
    type: "University",
  },
  {
    id: "59",
    name: "University of California, Davis Summer Sessions",
    location: "Davis, CA",
    type: "University",
  },
  {
    id: "60",
    name: "University of California, Santa Barbara Summer Sessions",
    location: "Santa Barbara, CA",
    type: "University",
  },
  {
    id: "61",
    name: "University of California, Santa Cruz Summer Sessions",
    location: "Santa Cruz, CA",
    type: "University",
  },
  {
    id: "62",
    name: "University of California, Riverside Summer Sessions",
    location: "Riverside, CA",
    type: "University",
  },
  {
    id: "63",
    name: "University of California, Merced Summer Sessions",
    location: "Merced, CA",
    type: "University",
  },
  {
    id: "64",
    name: "University of California, Hastings Summer Sessions",
    location: "San Francisco, CA",
    type: "University",
  },
  {
    id: "65",
    name: "University of California, San Francisco Summer Sessions",
    location: "San Francisco, CA",
    type: "University",
  },
  {
    id: "66",
    name: "University of California, Berkeley Online",
    location: "Berkeley, CA",
    type: "University",
  },
  {
    id: "67",
    name: "University of California, Los Angeles Online",
    location: "Los Angeles, CA",
    type: "University",
  },
  {
    id: "68",
    name: "University of California, San Diego Online",
    location: "San Diego, CA",
    type: "University",
  },
  {
    id: "69",
    name: "University of California, Irvine Online",
    location: "Irvine, CA",
    type: "University",
  },
  {
    id: "70",
    name: "University of California, Davis Online",
    location: "Davis, CA",
    type: "University",
  },
  {
    id: "71",
    name: "University of California, Santa Barbara Online",
    location: "Santa Barbara, CA",
    type: "University",
  },
  {
    id: "72",
    name: "University of California, Santa Cruz Online",
    location: "Santa Cruz, CA",
    type: "University",
  },
  {
    id: "73",
    name: "University of California, Riverside Online",
    location: "Riverside, CA",
    type: "University",
  },
  {
    id: "74",
    name: "University of California, Merced Online",
    location: "Merced, CA",
    type: "University",
  },
  {
    id: "75",
    name: "University of California, Hastings Online",
    location: "San Francisco, CA",
    type: "University",
  },
  {
    id: "76",
    name: "University of California, San Francisco Online",
    location: "San Francisco, CA",
    type: "University",
  },
  {
    id: "77",
    name: "University of California, Berkeley Global",
    location: "Berkeley, CA",
    type: "University",
  },
  {
    id: "78",
    name: "University of California, Los Angeles Global",
    location: "Los Angeles, CA",
    type: "University",
  },
  {
    id: "79",
    name: "University of California, San Diego Global",
    location: "San Diego, CA",
    type: "University",
  },
  {
    id: "80",
    name: "University of California, Irvine Global",
    location: "Irvine, CA",
    type: "University",
  },
  {
    id: "81",
    name: "University of California, Davis Global",
    location: "Davis, CA",
    type: "University",
  },
  {
    id: "82",
    name: "University of California, Santa Barbara Global",
    location: "Santa Barbara, CA",
    type: "University",
  },
  {
    id: "83",
    name: "University of California, Santa Cruz Global",
    location: "Santa Cruz, CA",
    type: "University",
  },
  {
    id: "84",
    name: "University of California, Riverside Global",
    location: "Riverside, CA",
    type: "University",
  },
  {
    id: "85",
    name: "University of California, Merced Global",
    location: "Merced, CA",
    type: "University",
  },
  {
    id: "86",
    name: "University of California, Hastings Global",
    location: "San Francisco, CA",
    type: "University",
  },
  {
    id: "87",
    name: "University of California, San Francisco Global",
    location: "San Francisco, CA",
    type: "University",
  },
  {
    id: "88",
    name: "University of California, Berkeley International",
    location: "Berkeley, CA",
    type: "University",
  },
  {
    id: "89",
    name: "University of California, Los Angeles International",
    location: "Los Angeles, CA",
    type: "University",
  },
  {
    id: "90",
    name: "University of California, San Diego International",
    location: "San Diego, CA",
    type: "University",
  },
  {
    id: "91",
    name: "University of California, Irvine International",
    location: "Irvine, CA",
    type: "University",
  },
  {
    id: "92",
    name: "University of California, Davis International",
    location: "Davis, CA",
    type: "University",
  },
  {
    id: "93",
    name: "University of California, Santa Barbara International",
    location: "Santa Barbara, CA",
    type: "University",
  },
  {
    id: "94",
    name: "University of California, Santa Cruz International",
    location: "Santa Cruz, CA",
    type: "University",
  },
  {
    id: "95",
    name: "University of California, Riverside International",
    location: "Riverside, CA",
    type: "University",
  },
  {
    id: "96",
    name: "University of California, Merced International",
    location: "Merced, CA",
    type: "University",
  },
  {
    id: "97",
    name: "University of California, Hastings International",
    location: "San Francisco, CA",
    type: "University",
  },
  {
    id: "98",
    name: "University of California, San Francisco International",
    location: "San Francisco, CA",
    type: "University",
  },
  {
    id: "99",
    name: "University of California, Berkeley Professional",
    location: "Berkeley, CA",
    type: "University",
  },
  {
    id: "100",
    name: "University of California, Los Angeles Professional",
    location: "Los Angeles, CA",
    type: "University",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({
        institutions: [],
        total: 0,
        message: "Query must be at least 2 characters long",
      });
    }

    // Search institutions by name (case-insensitive)
    const filteredInstitutions = institutions.filter(
      (institution) =>
        institution.name.toLowerCase().includes(query.toLowerCase()) ||
        institution.location.toLowerCase().includes(query.toLowerCase())
    );

    // Limit results to 10 for performance
    const limitedResults = filteredInstitutions.slice(0, 10);

    return NextResponse.json({
      institutions: limitedResults,
      total: limitedResults.length,
      query: query,
    });
  } catch (error) {
    console.error("Institution search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
