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

export default function CustomTable({ responseData }) {
  return (
    <div className="w-full rounded-md border border-gray-700 overflow-y-auto scrollbar-thin">
      <Table className="bg-white">
        {/* Table Header */}
        <TableHeader className="bg-gray-900 text-white font-bold rounded-t-md">
          <TableRow>
            <TableHead className="text-sm text-white font-semibold p-4">Company Name</TableHead>
            <TableHead className="text-sm text-white font-semibold p-4">Position</TableHead>
            <TableHead className="text-sm text-white font-semibold p-4">Platform</TableHead>
            <TableHead className="text-sm text-white font-semibold p-4">Status</TableHead>
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody className="h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700">
          {responseData.appliedJobs && responseData.appliedJobs.length > 0 ? (
            responseData.appliedJobs.map((job, index) => (
              <TableRow key={index} className="border-b border-gray-700 ">
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
                  {job.status}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-sm text-gray-400 font-normal p-4"
              >
                No jobs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
