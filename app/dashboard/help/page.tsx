'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileSidebar } from '@/components/dashboard/MobileSidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { HelpCircle, Book, Video, MessageCircle, Mail, Phone, ExternalLink } from 'lucide-react'

export default function HelpCenterPage() {
  const { user, isLoaded } = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (isLoaded && !user) {
    redirect('/sign-in')
  }

  const helpTopics = [
    {
      icon: Book,
      title: 'Getting Started Guide',
      description: 'Learn the basics of managing your salon with Braid Pilot',
      link: '#'
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch step-by-step tutorials on key features',
      link: '#'
    },
    {
      icon: MessageCircle,
      title: 'FAQs',
      description: 'Find answers to commonly asked questions',
      link: '#'
    }
  ]

  const faqs = [
    {
      question: 'How do I add a new braider to my team?',
      answer: 'Navigate to the Braiders page from the sidebar and click "Add New Braider". Fill in their details including name, skill level, and specialties.'
    },
    {
      question: 'How do I manage booking capacity?',
      answer: 'Go to the Capacity page to set maximum concurrent bookings, buffer times between appointments, and block specific time slots.'
    },
    {
      question: 'How do clients book appointments?',
      answer: 'Share your unique booking link (found on your dashboard) with clients. They can select services, choose times, and book directly.'
    },
    {
      question: 'How do I update my pricing?',
      answer: 'Use the onboarding tool to update your service pricing. You can access it from Settings > Pricing Configuration.'
    },
    {
      question: 'What is the platform fee?',
      answer: 'Braid Pilot charges a 5% platform fee on each successful booking to maintain and improve the service.'
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-[1600px] mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
              <p className="text-sm text-gray-600 mt-1">Get help and learn how to use Braid Pilot effectively</p>
            </div>

            {/* Quick Help Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {helpTopics.map((topic) => (
                <a
                  key={topic.title}
                  href={topic.link}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-indigo-100 p-3">
                      <topic.icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{topic.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* FAQs Section */}
            <div className="bg-white rounded-lg border border-gray-200 mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {faqs.map((faq, index) => (
                  <details key={index} className="group">
                    <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between">
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <HelpCircle className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-6 pb-4 text-sm text-gray-600">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
              <h2 className="text-lg font-semibold mb-4">Contact Support</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="mailto:support@braidpilot.com"
                  className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-600">support@braidpilot.com</p>
                  </div>
                </a>

                <a
                  href="tel:+1-555-0123"
                  className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <Phone className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Support</p>
                    <p className="text-sm text-gray-600">+1 (555) 0123</p>
                  </div>
                </a>

                <a
                  href="#"
                  className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <MessageCircle className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Live Chat</p>
                    <p className="text-sm text-gray-600">Available 9AM-5PM EST</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Documentation Link */}
            <div className="mt-6 rounded-lg bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Book className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Full Documentation</p>
                    <p className="text-sm text-blue-700">Access detailed guides and API documentation</p>
                  </div>
                </div>
                <a
                  href="https://docs.braidpilot.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  View Docs
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}