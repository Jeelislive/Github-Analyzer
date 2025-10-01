export default function Testimonials() {
  const testimonials = [
    {
      quote: "Clear visibility into my contributions and PRs helped me plan smarter and ship faster.",
      author: "John Smith",
      role: "Senior Developer at TechCorp",
      avatar: "JS"
    },
    {
      quote: "Perfect for open source. We track issues and reviews effortlessly across busy repos.",
      author: "Maria Johnson", 
      role: "OSS Maintainer",
      avatar: "MJ"
    },
    {
      quote: "Actionable insights on velocity and quality improved our PR turnaround time by 30%.",
      author: "Alex Kim",
      role: "CTO at StartupXYZ", 
      avatar: "AK"
    }
  ]

  return (
    <section className="container py-24">
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-3xl md:text-4xl font-bold">Trusted by developers</h2>
        <p className="text-xl text-muted-foreground">
          Join thousands of developers who rely on accurate GitHub analytics
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-card border rounded-lg p-6 space-y-4">
            <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                {testimonial.avatar}
              </div>
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}