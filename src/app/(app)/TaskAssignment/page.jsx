"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ClipboardList, Calendar, User, Flag } from "lucide-react";

const priorityColor = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-red-50 text-red-700 border-red-200",
};
const statusColor = {
  pending: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-50 text-blue-700",
  completed: "bg-emerald-50 text-emerald-700",
};

export default function TaskAssignment() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [taskType, setTaskType] = useState("assigned");

  const tasks = [];

  const filtered = tasks.filter(t => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (taskType === "assigned") return t.task_type !== "self";
    return t.task_type === "self";
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Task Assignment</h1>
          <p className="text-slate-500 text-sm mt-1">Assign and manage tasks for your team</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
          <Plus className="w-4 h-4" /> New Task
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button
            onClick={() => setTaskType("assigned")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${taskType === "assigned" ? "bg-teal-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            Assigned Tasks
          </button>
          <button
            onClick={() => setTaskType("self")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-l border-slate-200 ${taskType === "self" ? "bg-teal-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            Self Tasks
          </button>
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-slate-400">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No tasks found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => (
            <Card key={task.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{task.title}</p>
                    {task.description && <p className="text-sm text-slate-500 mt-1">{task.description}</p>}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className={`text-xs ${priorityColor[task.priority] || ""}`}>{task.priority}</Badge>
                      <Badge className={`text-xs ${statusColor[task.status] || ""}`}>{task.status}</Badge>
                      {task.assigned_to_name && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <User className="w-3 h-3" /> {task.assigned_to_name}
                        </Badge>
                      )}
                      {task.due_date && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Calendar className="w-3 h-3" /> {task.due_date}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
