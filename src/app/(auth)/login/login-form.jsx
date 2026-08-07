"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { loginAction } from "./actions";

const initialState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <Card className="w-full max-w-md border-slate-100">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-sm mx-auto mb-4">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">TherapyDocs</h1>
          <p className="text-sm text-slate-400 mt-1">Visit Documentation</p>
        </div>

        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-slate-700">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@therapyvisit.com"
              required
              autoComplete="email"
              className="border-slate-200 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-slate-700">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="border-slate-200 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            disabled={isPending}
          >
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
