import { useState } from "react";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { Button, Card, Field, Input, Textarea, Select } from "@/components/ui-kit";
import { sendContactMessage } from "@/services/contact";
import { company, serviceCategories } from "@/central/util/mockdata";
import { isEmail, required, validate } from "@/utils/validation";


const empty = { fullName: "", email: "", phone: "", subject: "", message: "" };

export default function ContactPage() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: "idle", message: "" });

  function update(field) {
    return (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values, {
      fullName: (v) => required(v, "Full name"),
      email: (v) => (!v ? "Email is required" : !isEmail(v) ? "Enter a valid email" : ""),
      subject: (v) => required(v, "Subject"),
      message: (v) => required(v, "Message"),
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setStatus({ state: "loading", message: "" });
    try {
      const response = await sendContactMessage(values);
      setStatus({ state: "success", message: response.message });
      setValues(empty);
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Contact"
        title="Let's talk about what you need"
        description="Send a message and our team will respond within one working day."
      />

      <section className="container-page grid gap-6 py-16 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-base font-bold text-foreground">Contact details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Address", company.address],
                ["Phone", company.phone],
                ["Alt. phone", company.altPhone],
                ["Email", company.email],
                ["Working hours", company.workingHours],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</dt>
                  <dd className="text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card className="bg-navy p-6">
            <h2 className="text-base font-bold text-white">Need a custom solution?</h2>
            <p className="mt-2 text-sm text-white/65">
              Use the innovation form to describe your project, budget and timeline.
            </p>
            <a href="/innovation" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              Request a solution →
            </a>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-base font-bold text-foreground">Send a message</h2>
          <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="fullName" required error={errors.fullName}>
                <Input id="fullName" value={values.fullName} onChange={update("fullName")} invalid={!!errors.fullName} />
              </Field>
              <Field label="Email address" htmlFor="email" required error={errors.email}>
                <Input id="email" type="email" value={values.email} onChange={update("email")} invalid={!!errors.email} />
              </Field>
              <Field label="Phone number" htmlFor="phone" hint="Optional">
                <Input id="phone" value={values.phone} onChange={update("phone")} />
              </Field>
              <Field label="Subject" htmlFor="subject" required error={errors.subject}>
                <Select id="subject" value={values.subject} onChange={update("subject")} invalid={!!errors.subject}>
                  <option value="">Select a subject</option>
                  {serviceCategories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Message" htmlFor="message" required error={errors.message}>
              <Textarea id="message" rows={6} value={values.message} onChange={update("message")} invalid={!!errors.message} />
            </Field>

            {status.state === "success" && (
              <p className="rounded-md bg-success/12 px-3 py-2 text-sm font-medium text-success">{status.message}</p>
            )}
            {status.state === "error" && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {status.message}
              </p>
            )}

            <Button type="submit" size="lg" loading={status.state === "loading"}>
              Send message
            </Button>
          </form>
        </Card>
      </section>
    </SiteLayout>
  );
}
