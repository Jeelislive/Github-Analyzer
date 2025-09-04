'use client'

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { useState } from 'react'

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    {
      name: "Free",
      description: "Perfect for personal projects",
      price: "$0",
      features: [
        "5 repositories per month",
        "Basic documentation generation", 
        "Markdown export",
        "Community support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro", 
      description: "For professional developers",
      price: "$19",
      features: [
        "Unlimited repositories",
        "Advanced AI analysis", 
        "All export formats (PDF, HTML)",
        "Custom themes",
        "Priority support",
        "Team collaboration"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      description: "For teams and organizations", 
      price: "Custom",
      features: [
        "Everything in Pro",
        "On-premise deployment",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee",
        "Advanced security"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ]

  return (
    <section id="pricing" className="w-full py-24 md:py-32 bg-muted/20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold">Simple, transparent pricing</h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative bg-card border rounded-lg p-8 ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">{plan.price}</div>
                  {plan.price !== "Custom" && <div className="text-muted-foreground">/month</div>}
                </div>
              </div>

              <ul className="space-y-3 my-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full" 
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Final CTA Section */}
        <div className="text-center mt-24 space-y-8">
          <h3 className="text-3xl font-bold">Ready to generate amazing docs?</h3>
          <p className="text-xl text-muted-foreground">
            Join thousands of developers who trust us with their documentation
          </p>
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input 
                type="url"
                placeholder="https://github.com/username/repository"
                className="w-full h-12 px-4 border rounded-md"
              />
            </div>
            <Button size="lg" className="h-12 px-8">
              Analyze Repo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}