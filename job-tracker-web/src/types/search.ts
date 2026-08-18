
/* 
{
  "id": "5783640894",                    // string, not number
  "title": "Lead Software Engineer, Diagnostics",
  "company":  { "display_name": "Trane Technologies" },   // nested
  "location": { "display_name": "Bloomington, Hennepin County",
                "area": ["US","Minnesota","Hennepin County","Bloomington"] },
  "created": "2026-07-01T08:33:38Z",     // ISO — your "Posted 2 hours ago"
  "salary_min": 138571.66,               // number, not a string
  "salary_max": 138571.66,
  "salary_is_predicted": "1",           // string "1"/"0" — NOT a boolean
  "redirect_url": "https://...",         // apply link
  "description": "…truncated with an ellipsis…",
  "category": { "label": "IT Jobs", "tag": "it-jobs" },
  "contract_time": "full_time",          // 48/50 — the only genuinely optional field
  "latitude": 44.83, "longitude": -93.27,
  "__CLASS__": "Adzuna::API::Response::Job"   // Perl serialization junk, ignore
}
*/

export type SearchList = {
    id: string;
    title: string;
    company: string;
    location: string;
    salary_min: number;
    salary_max: number;
    description: string; 
}

