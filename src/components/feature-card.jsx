import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function FeatureCard({ icon, title, description, href }) {
  return (
    <Link
      href={href}
      className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full border border-gray-100 hover:border-green-200"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{title}</h3>
      <p className="text-gray-600 mb-4 flex-grow">{description}</p>
      <div className="flex items-center text-green-600 font-medium mt-auto">
        <span className="mr-2">Learn more</span>
        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  )
}

