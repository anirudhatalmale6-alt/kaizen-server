import { z } from "zod";

const Departments = [
  "HR",
  "Marketing",
  "Sales",
  "IT",
  "Supply chain",
  "Manufacturing",
  "Projects",
  "SHEQ",
  "IPD",
  "Finance",
  "Performance",
  "Legal",
  "Others",
]

export const createInitiativeSchema = z.object({
  fullName: z.string("Full Name Required").min(1),
  email: z
    .string()
    .email("Invalid email format")
    .refine(
      (email) =>
        email.endsWith("@sidco.com.sa") ||
        email.endsWith("@nationalcare.com.sa") ||
        email.endsWith("@srg.com.sa"),
      {
        message: "Email must end with @sidco.com.sa, @nationalcare.com.sa, or @srg.com.sa",
      }
    ),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  position: z.string().min(2, "Position must be at least 2 characters"),
  department: z.enum(Departments),
  title: z.string().min(1, "Title is required"),
  details: z.string().min(1, "Details are required"),
});

export const updateStatusSchema = z.object({
  status: z.enum(["Pending", "Reviewed", "Implemented"],
    { required_error: "Status is required" }
  ),
});
