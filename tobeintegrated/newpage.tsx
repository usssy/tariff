import Link from "next/link"
import { ArrowLeft, FileSpreadsheet, Upload, FileCheck, FileWarning } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function UploadPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              Help
            </Button>
            <Button size="sm">Dashboard</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Upload Your Inventory Data
              </h1>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed">
                This is a placeholder for our CSV upload functionality. Soon you'll be able to upload your inventory
                data here for tariff risk analysis.
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-4xl">
            {/* Upload Area */}
            <Card className="mb-8 border-2 border-dashed border-gray-200 bg-gray-50">
              <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="absolute top-4 right-4 py-1 px-3 bg-amber-100 text-amber-800 text-xs rounded-full">
                  Placeholder
                </div>
                <div className="mb-4 p-4 rounded-full bg-blue-100">
                  <FileSpreadsheet className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Drag & Drop Your Excel File</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  Upload your inventory procurement spreadsheet to analyze tariff risks and get strategic
                  recommendations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="gap-2">
                    <Upload className="h-4 w-4" /> Select File
                  </Button>
                  <Button variant="outline" size="lg">
                    View Sample Format
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-6">Supported formats: .xlsx, .xls, .csv (Max size: 10MB)</p>
              </CardContent>
            </Card>

            {/* What to Expect Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center">What to Expect After Upload</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: <FileCheck className="h-8 w-8 text-green-600" />,
                    title: "Data Validation",
                    description: "We'll check your spreadsheet format and data quality.",
                  },
                  {
                    icon: <FileSpreadsheet className="h-8 w-8 text-blue-600" />,
                    title: "AI Analysis",
                    description: "Our AI will analyze your inventory against current tariff policies.",
                  },
                  {
                    icon: <FileWarning className="h-8 w-8 text-amber-600" />,
                    title: "Risk Assessment",
                    description: "You'll receive a detailed report with risk scores and recommendations.",
                  },
                ].map((step, index) => (
                  <Card key={index} className="border-none shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="mb-2">{step.icon}</div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{step.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sample Reports */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">Sample Reports</h2>
              <Tabs defaultValue="risk" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
                  <TabsTrigger value="market">Market Analysis</TabsTrigger>
                  <TabsTrigger value="news">News Impact</TabsTrigger>
                </TabsList>
                <TabsContent value="risk" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sample Tariff Risk Assessment</CardTitle>
                      <CardDescription>
                        See how we analyze your inventory's exposure to current and predicted tariff changes.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg overflow-hidden border">
                        <div className="bg-gray-100 p-4 border-b">
                          <div className="h-40 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                            <div className="text-blue-600 font-semibold">Risk Assessment Visualization</div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="text-sm font-medium">Overall Risk Score</div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 w-[65%]"></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Low Risk</span>
                                <span>Medium Risk</span>
                                <span>High Risk</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <div className="text-sm font-medium">High-Risk Items</div>
                                <div className="text-2xl font-bold">24</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm font-medium">Potential Impact</div>
                                <div className="text-2xl font-bold text-red-600">+$45,320</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="market" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sample Market Analysis</CardTitle>
                      <CardDescription>
                        Track commodities and securities prices affecting your supply chain.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg overflow-hidden border">
                        <div className="bg-gray-100 p-4 border-b">
                          <div className="h-40 bg-gradient-to-r from-green-100 to-green-50 rounded-lg flex items-center justify-center">
                            <div className="text-green-600 font-semibold">Market Price Trends</div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              {[
                                { name: "Steel", price: "$1,245", change: "+2.3%" },
                                { name: "Aluminum", price: "$2,100", change: "-0.8%" },
                                { name: "Lumber", price: "$450", change: "+4.1%" },
                              ].map((commodity, index) => (
                                <div key={index} className="space-y-1">
                                  <div className="text-sm font-medium">{commodity.name}</div>
                                  <div className="text-lg font-bold">{commodity.price}</div>
                                  <div
                                    className={`text-xs ${commodity.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                                  >
                                    {commodity.change}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="news" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sample News Impact</CardTitle>
                      <CardDescription>
                        See how global news and policy changes affect your inventory risk.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg overflow-hidden border">
                        <div className="bg-gray-100 p-4 border-b">
                          <div className="h-40 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
                            <div className="text-purple-600 font-semibold">News Impact Analysis</div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="space-y-4">
                            {[
                              {
                                title: "New Tariffs Announced on Chinese Imports",
                                impact: "High Impact",
                                description: "25% tariff on electronics and manufacturing components.",
                              },
                              {
                                title: "EU-US Trade Negotiations Resume",
                                impact: "Medium Impact",
                                description: "Potential reduction in automotive and machinery tariffs.",
                              },
                            ].map((news, index) => (
                              <div key={index} className="p-3 border rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div className="font-medium">{news.title}</div>
                                  <div
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      news.impact === "High Impact"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {news.impact}
                                  </div>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">{news.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container py-6 px-4 md:px-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} TariffDefense. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
