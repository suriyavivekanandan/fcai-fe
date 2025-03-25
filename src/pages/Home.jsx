// pages/index.js
import Link from "next/link"
import { FeatureCard } from "../components/feature-card"
import Navbar from "../components/Navbar"
import { Button} from "../components/ui/button"
import {
  Scale,
  ClipboardList,
  Database,
  Calendar,
  BarChart,
  ArrowRight,
  Leaf,
  Utensils,
  PieChart,
  Users,
} from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 -z-10" />
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-no-repeat bg-cover bg-center opacity-10 -z-10" />
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
            <div className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 mb-2">
              Sustainable Food Management
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Reduce Food Waste, <span className="text-green-600">Save Our Planet</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Our intelligent platform helps you track, manage, and significantly reduce food waste, saving money and
              contributing to a more sustainable future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 py-3 text-base font-medium">
                <Link href="/initial-entry">
                  <span className="text-white no-underline">Get Started</span>
                </Link>
              </Button>
              <Button variant="outline" className="rounded-full px-8 py-3 text-base font-medium border-2">
                <Link href="/about">
                  <span className="no-underline">Learn More</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-green-50 rounded-xl">
              <div className="text-4xl font-bold text-green-600 mb-2">40%</div>
              <p className="text-gray-600">of food is wasted globally each year</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-green-50 rounded-xl">
              <div className="text-4xl font-bold text-green-600 mb-2">$1.2T</div>
              <p className="text-gray-600">economic cost of food wastage annually</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-green-50 rounded-xl">
              <div className="text-4xl font-bold text-green-600 mb-2">30%</div>
              <p className="text-gray-600">reduction possible with proper management</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gradient-to-b from-white to-green-50">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                Food Waste Management is designed to help individuals, businesses, and organizations monitor and reduce
                food waste through intelligent tracking and analytics.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                By recording initial and remaining food quantities, analyzing consumption patterns, and facilitating
                redistribution, we create a comprehensive ecosystem that transforms how we think about food usage.
              </p>
              <p className="text-lg text-gray-600">
                Our platform has helped hundreds of organizations reduce their food waste by up to 40%, saving costs and
                contributing to environmental sustainability.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-green-200 rounded-2xl transform rotate-3"></div>
              <div className="absolute -inset-4 bg-green-300 rounded-2xl transform -rotate-3 opacity-70"></div>
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <img src="images\Food-loss-and-waste-in-India-new-1024x336.jpg" alt="Food waste reduction" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Food Waste Solution</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform offers a complete set of tools to help you manage food waste efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <FeatureCard
              icon={<Scale className="h-10 w-10 text-blue-600" />}
              title="Initial Entry"
              description="Record initial weight and details of food items with our intuitive interface"
              href="/initial-entry"
            />

            <FeatureCard
              icon={<ClipboardList className="h-10 w-10 text-green-600" />}
              title="Remaining Entry"
              description="Update remaining weights and track wastage with precision"
              href="/remaining-entry"
            />

            <FeatureCard
              icon={<Database className="h-10 w-10 text-purple-600" />}
              title="Data View"
              description="Analyze comprehensive food waste data and identify trends"
              href="/data-view"
            />

            <FeatureCard
              icon={<BarChart className="h-10 w-10 text-orange-600" />}
              title="Food Analysis"
              description="Visualize waste patterns and receive AI-powered recommendations"
              href="/food-analysis"
            />

            <FeatureCard
              icon={<Calendar className="h-10 w-10 text-red-600" />}
              title="Bookings"
              description="Manage trust bookings for remaining food and coordinate redistribution"
              href="/bookings"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-green-50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive solution offers multiple benefits for your organization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Environmental Impact</h3>
              <p className="text-gray-600">Reduce your carbon footprint by minimizing food waste</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <PieChart className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cost Savings</h3>
              <p className="text-gray-600">Save up to 30% on food costs through efficient management</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Utensils className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Menu Optimization</h3>
              <p className="text-gray-600">Improve menu planning based on consumption analytics</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Impact</h3>
              <p className="text-gray-600">Facilitate food donation and redistribution to those in need</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from organizations that have transformed their food waste management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-green-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-sm text-gray-600">Restaurant Manager</p>
                </div>
              </div>
              <p className="text-gray-700">
                "This platform has revolutionized how we manage our kitchen inventory. We've reduced our food waste by
                35% in just three months!"
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Michael Chen</h4>
                  <p className="text-sm text-gray-600">Hotel F&B Director</p>
                </div>
              </div>
              <p className="text-gray-700">
                "The analytics provided by this system have helped us optimize our buffet offerings and significantly
                reduce overproduction."
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Emily Rodriguez</h4>
                  <p className="text-sm text-gray-600">University Dining Services</p>
                </div>
              </div>
              <p className="text-gray-700">
                "We've been able to redirect excess food to local shelters and track our impact. It's a win-win for our
                budget and community."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">Ready to Reduce Your Food Waste?</h2>
              <p className="text-xl opacity-90">
                Join hundreds of organizations already saving money and the environment with our platform.
              </p>
            </div>
            <Button className="bg-white text-green-700 hover:bg-gray-100 rounded-full px-8 py-3 text-lg font-medium">
              <Link href="/initial-entry">
                <span className="flex items-center gap-2 no-underline text-green-700">
                  Get Started Now <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Food Waste Management</h3>
              <p className="text-gray-400">
                Innovative solutions for tracking and reducing food waste in organizations of all sizes.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Features</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/initial-entry">
                    <span className="hover:text-green-400 transition">Initial Entry</span>
                  </Link>
                </li>
                <li>
                  <Link href="/remaining-entry">
                    <span className="hover:text-green-400 transition">Remaining Entry</span>
                  </Link>
                </li>
                <li>
                  <Link href="/data-view">
                    <span className="hover:text-green-400 transition">Data View</span>
                  </Link>
                </li>
                <li>
                  <Link href="/food-analysis">
                    <span className="hover:text-green-400 transition">Food Analysis</span>
                  </Link>
                </li>
                <li>
                  <Link href="/bookings">
                    <span className="hover:text-green-400 transition">Bookings</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about">
                    <span className="hover:text-green-400 transition">About Us</span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <span className="hover:text-green-400 transition">Contact</span>
                  </Link>
                </li>
                <li>
                  <Link href="/blog">
                    <span className="hover:text-green-400 transition">Blog</span>
                  </Link>
                </li>
                <li>
                  <Link href="/careers">
                    <span className="hover:text-green-400 transition">Careers</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms">
                    <span className="hover:text-green-400 transition">Terms of Service</span>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy">
                    <span className="hover:text-green-400 transition">Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link href="/cookies">
                    <span className="hover:text-green-400 transition">Cookie Policy</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 mt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Food Waste Management. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}