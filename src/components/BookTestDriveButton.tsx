"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Modal } from "@/components/Modal";
import { TestDriveForm } from "@/components/forms/TestDriveForm";

export function BookTestDriveButton({
  carSlug,
  carName,
  className = "sm-btn sm-btn--primary",
  label = "Book Test Drive",
  withIcon = true,
}: {
  carSlug?: string;
  carName?: string;
  className?: string;
  label?: string;
  withIcon?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {withIcon ? <Calendar size={15} aria-hidden="true" /> : null}
        {label}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Book a test drive"
        subtitle={
          carName
            ? `${carName} · Mombasa Road, Nairobi`
            : "Mombasa Road, Nairobi · Mon–Sat"
        }
      >
        <TestDriveForm carSlug={carSlug} carName={carName} />
      </Modal>
    </>
  );
}
