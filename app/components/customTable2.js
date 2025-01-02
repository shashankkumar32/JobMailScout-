"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function ToApplyJobsTable({ responseData }) {
  return (
    <div className="w-full rounded-md border border-gray-700 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700 overflow-y-auto h-[420px]">
      <Table className="bg-white">
        {/* Table Header */}
        <TableHeader className="bg-gray-900 text-white font-bold rounded-t-md">
          <TableRow>
            <TableHead className="text-sm text-white font-semibold p-4">
              Company Name
            </TableHead>
            <TableHead className="text-sm text-white font-semibold p-4">
              Position
            </TableHead>
            <TableHead className="text-sm text-white font-semibold p-4">
              Platform
            </TableHead>
            <TableHead className="text-sm text-white font-semibold p-4">
              Apply
            </TableHead>
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody className="h-full overflow-y-auto ">
          {responseData.toApplyJobs && responseData.toApplyJobs.length > 0 ? (
            responseData.toApplyJobs.map((job, index) => (
              <TableRow key={index} className="border-b border-gray-700 hover:bg-gray-100">
                <TableCell className="text-sm text-gray-900 font-normal p-4">
                  {job.CompanyName}
                </TableCell>
                <TableCell className="text-sm text-gray-900 font-normal p-4">
                  {job.Position}
                </TableCell>
                <TableCell className="text-sm text-gray-900 font-normal p-4">
                  {job.Platform}
                </TableCell>
                <TableCell className="text-sm text-gray-900 font-normal p-4">
                  <Button
                    variant="outline"
                    className="text-white bg-black border-gray-500 hover:bg-gray-700"
                    onClick={() => window.open(job.ApplyLink, "_blank")}
                  >
                    Apply
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-sm text-gray-400 font-normal p-4"
              >
                No jobs to apply for.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
