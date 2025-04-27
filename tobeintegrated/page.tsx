import Link from "next/link"
import { ArrowRight, BarChart3, FileSpreadsheet, Globe, Shield, TrendingUp, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">TariffDefense</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
              How It Works
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              Log in
            </Button>
            <Button size="sm">Sign up</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">
                  Tariff Intelligence for SMEs
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Protect Your Supply Chain from Tariff Risks
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl">
                  Upload your inventory data and get AI-powered tariff risk assessments, market insights, and
                  cost-saving recommendations.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/upload">
                    <Button size="lg" className="gap-1">
                      Start Your Analysis <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg">
                    Book a Demo
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[500px] aspect-video rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-1">
                  <div className="absolute inset-0 bg-white/90 rounded-lg m-1 flex items-center justify-center">
                    <div className="w-4/5 h-4/5 bg-gray-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-16 w-16 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Tariff Tracking Map Placeholder */}
        <section className="w-full py-12 md:py-16 bg-gray-50 border-y">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">LIVE TRACKING</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Global Tariff Impact Map</h2>
              <p className="max-w-[700px] text-gray-500 md:text-lg">
                Real-time visualization of tariff changes and their impact across global supply chains.
              </p>
            </div>
            <div className="mx-auto max-w-5xl border-2 border-dashed border-gray-300 rounded-xl bg-white p-4">
              <div className="aspect-[16/9] bg-gray-100 rounded-lg flex flex-col items-center justify-center p-6 text-center">
                <Globe className="h-16 w-16 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Live Tariff Tracking Map</h3>
                <p className="text-gray-500 max-w-md mb-4">
                  This area will display an interactive global map showing real-time tariff changes and their impact on
                  various industries and regions.
                </p>
                <div className="text-sm px-4 py-2 bg-blue-50 text-blue-800 rounded-full">Coming Soon</div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="w-full py-8 border-y bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="text-sm text-gray-500">TRUSTED BY BUSINESSES ACROSS INDUSTRIES</div>
              <div className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16">
                {["Construction Co.", "Furniture Inc.", "E-Commerce Ltd.", "Manufacturing Group", "Import Experts"].map(
                  (company) => (
                    <div key={company} className="text-lg font-semibold text-gray-800">
                      {company}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Powerful Tariff Intelligence
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform combines AI, real-time market data, and news analysis to give you a competitive edge.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              {[
                {
                  icon: <FileSpreadsheet className="h-10 w-10 text-blue-600" />,
                  title: "Excel Integration",
                  description: "Seamlessly upload your inventory procurement spreadsheets for instant analysis.",
                },
                {
                  icon: <Shield className="h-10 w-10 text-blue-600" />,
                  title: "Tariff Risk Assessment",
                  description:
                    "AI-powered analysis of your inventory's exposure to current and predicted tariff changes.",
                },
                {
                  icon: <Globe className="h-10 w-10 text-blue-600" />,
                  title: "Global News Monitoring",
                  description:
                    "Real-time tracking of trade policies and geopolitical events affecting your supply chain.",
                },
                {
                  icon: <TrendingUp className="h-10 w-10 text-blue-600" />,
                  title: "Market Price Tracking",
                  description: "Live commodities and securities prices with interactive graphs and trend analysis.",
                },
                {
                  icon: <BarChart3 className="h-10 w-10 text-blue-600" />,
                  title: "Predictive Analytics",
                  description: "Forecast potential tariff impacts on your specific inventory and procurement costs.",
                },
                {
                  icon: <ArrowRight className="h-10 w-10 text-blue-600" />,
                  title: "Strategic Recommendations",
                  description: "Actionable insights to optimize your supply chain and minimize tariff exposure.",
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="border-2 border-gray-100 transition-all hover:border-blue-100 hover:shadow-md"
                >
                  <CardHeader>
                    <div className="p-2 w-fit rounded-lg bg-blue-50 mb-2">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-blue-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">Process</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How TariffDefense Works</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A simple three-step process to protect your business from tariff risks.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
              {[
                {
                  step: "01",
                  title: "Upload Your Data",
                  description: "Simply upload your inventory procurement Excel spreadsheets to our secure platform.",
                },
                {
                  step: "02",
                  title: "AI Analysis",
                  description: "Our AI analyzes your data against current tariff policies, news, and market trends.",
                },
                {
                  step: "03",
                  title: "Get Actionable Insights",
                  description: "Receive detailed risk assessments and strategic recommendations for your business.",
                },
              ].map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-900 font-bold text-xl">
                    {step.step}
                  </div>
                  <div className="mt-4 space-y-2">
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-gray-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interface Demo Placeholder */}
        <section className="w-full py-12 md:py-24 bg-white border-t">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">DEMO</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Try Our Interface</h2>
                <p className="max-w-[700px] text-gray-500 md:text-lg">
                  Upload your inventory data and see how our AI analyzes tariff risks in real-time.
                </p>
              </div>
            </div>

            <div className="mx-auto max-w-4xl border-2 border-dashed border-gray-300 rounded-xl bg-white p-4">
              <div className="absolute top-4 right-4 py-1 px-3 bg-amber-100 text-amber-800 text-xs rounded-full">
                Placeholder
              </div>
              <div className="flex flex-col md:flex-row gap-6 min-h-[600px]">
                {/* Left side - Upload Interface */}
                <div className="flex-1 flex flex-col border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b">
                    <h3 className="font-semibold">Upload Inventory Data</h3>
                  </div>
                  <div className="flex-1 p-6 flex flex-col items-center justify-center bg-white">
                    <div className="w-full max-w-sm space-y-6">
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                        <FileSpreadsheet className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                        <p className="text-sm text-gray-500 mb-4">Drag and drop your CSV file here</p>
                        <Button size="sm" className="gap-1">
                          <Upload className="h-4 w-4" /> Browse Files
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Industry</label>
                          <select className="w-full p-2 border rounded-md text-sm">
                            <option>Construction</option>
                            <option>Furniture</option>
                            <option>Electronics</option>
                            <option>Automotive</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Analysis Type</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="tariff" defaultChecked className="rounded" />
                              <label htmlFor="tariff" className="text-sm">
                                Tariff Risk
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="market" defaultChecked className="rounded" />
                              <label htmlFor="market" className="text-sm">
                                Market Impact
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="news" defaultChecked className="rounded" />
                              <label htmlFor="news" className="text-sm">
                                News Analysis
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="recommendations" defaultChecked className="rounded" />
                              <label htmlFor="recommendations" className="text-sm">
                                Recommendations
                              </label>
                            </div>
                          </div>
                        </div>

                        <Button className="w-full">Analyze Inventory</Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Results Interface */}
                <div className="flex-1 flex flex-col border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b">
                    <h3 className="font-semibold">Analysis Results</h3>
                  </div>
                  <div className="flex-1 p-6 bg-white flex flex-col">
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <BarChart3 className="h-16 w-16 text-blue-600 mx-auto" />
                        <p className="text-gray-500">Your analysis results will appear here</p>
                        <div className="text-sm px-4 py-2 bg-blue-50 text-blue-800 rounded-full mx-auto w-fit">
                          Coming Soon
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Overall Risk Score</div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 w-[65%]"></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">High-Risk Items:</span>
                            <span className="font-semibold ml-1">24</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Potential Impact:</span>
                            <span className="font-semibold text-red-600 ml-1">+$45,320</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-600 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Protect Your Business from Tariff Risks?
                </h2>
                <p className="max-w-[900px] text-blue-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Upload your inventory data now and get started with our AI-powered tariff analysis.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/upload">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                    Upload Your Data
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-blue-700">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container flex flex-col gap-6 py-8 md:py-12 px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">TariffDefense</span>
            </div>
            <nav className="flex gap-6 text-sm">
              <Link href="#" className="text-gray-500 hover:underline underline-offset-4">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-500 hover:underline underline-offset-4">
                Terms of Service
              </Link>
              <Link href="#" className="text-gray-500 hover:underline underline-offset-4">
                Contact Us
              </Link>
            </nav>
          </div>
          <div className="text-sm text-gray-500">© {new Date().getFullYear()} TariffDefense. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
