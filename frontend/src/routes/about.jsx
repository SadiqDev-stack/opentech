import { createFileRoute } from "@tanstack/react-router";
import SiteLayout, { PageHero } from "@/components/SiteLayout";
import { ButtonLink, Card, CardGridSkeleton, ErrorState, SectionHeading } from "@/components/ui-kit";
import { useApiData } from "@/hooks/useApiData";
import { getLandingData } from "@/services/landing";
import { company, partners } from "@/central/util/mockdata";
import { initials } from "@/utils/format";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About OpenTech — Company, Store & Academy" },
      {
        name: "description",
        content:
          "OpenTech is a Nigerian technology company building software and hardware solutions, supplying components and training engineers.",
      },
      { property: "og:title", content: "About OpenTech" },
      {
        property: "og:description",
        content: "Meet the team and the three areas of OpenTech: Company, Store and Academy.",
      },
    ],
  }),
  component: AboutPage,
});

const process = [
  { step: "1", title: "Tell us your need", detail: "Share the problem, idea or requirement with our team." },
  { step: "2", title: "We analyse & plan", detail: "We study the request and propose the best approach." },
  { step: "3", title: "Build & deliver", detail: "We design, build and test the solution with quality checks." },
  { step: "4", title: "Support after", detail: "We hand over with documentation, training and support." },
];

function AboutPage() {
  const { data, loading, error, reload } = useApiData(getLandingData);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="About us"
        title="We build technology that solves real problems"
        description={company.description}
      >
        <ButtonLink to="/innovation">Request a solution</ButtonLink>
      </PageHero>

      <section className="container-page py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Our mission", detail: "Make quality technology, tools and training accessible across Nigeria." },
            { title: "Our vision", detail: "A generation of Nigerian engineers building world-class hardware and software." },
            { title: "Our approach", detail: "Practical work over theory: we build, we teach what we build, we supply what it takes." },
          ].map((item) => (
            <Card key={item.title} className="p-6">
              <h2 className="text-base font-bold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="container-page">
          <SectionHeading eyebrow="What we offer" title="Our services" align="center" />
          {loading ? (
            <CardGridSkeleton count={4} />
          ) : error ? (
            <ErrorState error={error} onRetry={reload} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(data?.services || []).map((service) => (
                <Card key={service.id} className="p-6">
                  <h3 className="text-base font-bold text-foreground">{service.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
                  <ul className="mt-4 space-y-1.5">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex gap-2 text-xs text-muted-foreground">
                        <span className="text-primary">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading eyebrow="How it works" title="Our simple process" align="center" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {process.map((item) => (
            <Card key={item.step} className="p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-primary">
                {item.step}
              </span>
              <h3 className="mt-4 text-sm font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="container-page">
          <SectionHeading eyebrow="Our team" title="The people behind OpenTech" align="center" />
          {loading ? (
            <CardGridSkeleton count={5} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {(data?.staff || []).map((person) => (
                <Card key={person.id} className="p-5 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy text-sm font-bold text-primary">
                    {initials(person.fullName)}
                  </span>
                  <h3 className="mt-3 text-sm font-bold text-foreground">{person.fullName}</h3>
                  <p className="text-xs font-medium text-primary">{person.role}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{person.bio}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading eyebrow="Brands we work with" title="Platforms and suppliers" align="center" />
        <div className="flex flex-wrap justify-center gap-3">
          {partners.map((partner) => (
            <span
              key={partner}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground"
            >
              {partner}
            </span>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
