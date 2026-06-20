"use client";
import { Job } from "@/types/job";
/* 
    📄 applied   🎯 5 Interviewing   📍 Waiting   ✅ 2 offers
    Response Rate: 29 %    Interview Rate: 32%     This week: 6 new

    gets all datas related to these from parent component

    how to get datas 
    1. total app = length of raws

*/

type StatsbarProps = {
    apps: Job[];
}


function Statsbar({apps}: StatsbarProps) {
    //filter app.status.includes(interview);

    const interview = apps.filter((app) => app.status.includes("interview"));
    const waiting = apps.filter((app) => app.status.includes("waiting"));

    console.log("interview", interview);

  return (
    <div className = "mt-4  items-center grid grid-cols-4  font-bold">
        <div className =""> 
            📄 {apps.length} applied</div>
        <div>
             🎯 {interview.length} Interveiwing
        </div>
        <div>
           📍{waiting.length} Waiting
        </div>
        <div>Offers</div>
    </div>
  )
}

export default Statsbar
