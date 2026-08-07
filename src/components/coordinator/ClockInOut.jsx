"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, LogIn, LogOut, Timer } from "lucide-react";

export default function ClockInOut() {
  const [openShift, setOpenShift] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const logs = [];
  const totalMinutesToday = 0;

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <Card className={`border-2 ${openShift ? "border-teal-400 bg-teal-50/30" : "border-slate-200"}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${openShift ? "bg-teal-100" : "bg-slate-100"}`}>
              <Clock className={`w-5 h-5 ${openShift ? "text-teal-600" : "text-slate-400"}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {openShift ? "Currently Clocked In" : "Not Clocked In"}
              </p>
              {openShift ? (
                <p className="text-xs text-teal-600 flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  {formatDuration(elapsed)} elapsed
                </p>
              ) : (
                <p className="text-xs text-slate-400">Today: {formatDuration(totalMinutesToday)} logged</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {totalMinutesToday > 0 && !openShift && (
              <Badge variant="outline" className="text-xs text-teal-700 border-teal-300 bg-teal-50">
                {formatDuration(totalMinutesToday)} today
              </Badge>
            )}
            {openShift ? (
              <Button className="bg-red-500 hover:bg-red-600 gap-2">
                <LogOut className="w-4 h-4" />
                Clock Out
              </Button>
            ) : (
              <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
                <LogIn className="w-4 h-4" />
                Clock In
              </Button>
            )}
          </div>
        </div>

        {logs.filter(l => l.clock_out).length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
            <p className="text-xs font-medium text-slate-500 mb-1">Today's Shifts</p>
            {logs.filter(l => l.clock_out).map(l => (
              <div key={l.id} className="flex items-center justify-between text-xs text-slate-500">
                <span>{l.clock_in} → {l.clock_out}</span>
                <span className="font-medium text-slate-700">{formatDuration(l.duration_minutes || 0)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
