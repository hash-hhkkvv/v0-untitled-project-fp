"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { dataPlans } from "@/lib/constants"
import { validatePhoneNumber } from "@/lib/utils"

// FlutterwaveCheckout type definition
declare global {
  interface Window {
    FlutterwaveCheckout: (options: any) => void
  }
}

export default function DataAirtimeShop() {
  const [greeting, setGreeting] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [airtimeAmount, setAirtimeAmount] = useState("")
  const [username, setUsername] = useState("Guest")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const customerCareLine = "07042696131"

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  // Load username from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = localStorage.getItem("username")
      if (storedUsername) {
        setUsername(storedUsername)
      }
    }
  }, [])

  // Load Flutterwave script
  useEffect(() => {
    if (typeof window !== "undefined" && !window.FlutterwaveCheckout) {
      const script = document.createElement("script")
      script.src = "https://checkout.flutterwave.com/v3.js"
      script.async = true
      script.onload = () => setIsScriptLoaded(true)
      document.body.appendChild(script)

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script)
        }
      }
    } else if (window.FlutterwaveCheckout) {
      setIsScriptLoaded(true)
    }
  }, [])

  const handleFlutterwavePayment = (amount: number, description: string) => {
    // Clear previous messages
    setError("")
    setSuccess("")

    if (!isScriptLoaded) {
      setError("Payment system is still loading. Please try again in a moment.")
      return
    }

    if (!phoneNumber) {
      setError("Please enter a phone number.")
      return
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid Nigerian phone number.")
      return
    }

    setIsLoading(true)

    window.FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-8d04e67c2be0f9d273f073be2ce40c25-X",
      tx_ref: "txn-" + Date.now(),
      amount: amount,
      currency: "NGN",
      payment_options: "card,ussd,banktransfer",
      customer: {
        email: "customer@example.com",
        phonenumber: phoneNumber,
        name: username,
      },
      callback: (data: any) => {
        setIsLoading(false)
        setSuccess(`Payment successful! Transaction ID: ${data.transaction_id}`)
      },
      onclose: () => {
        setIsLoading(false)
      },
      customizations: {
        title: "QuickTopUp",
        description: description,
        logo: "https://your-logo-url.com/logo.png",
      },
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">{greeting}! Welcome to QuickTopUp</h1>

        <div className="mb-6">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone Number
          </Label>
          <Input
            id="phone"
            placeholder="e.g. 08012345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">Format: 080XXXXXXXX, 090XXXXXXXX, etc.</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-500 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="data" className="mb-10">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="data">Data Plans</TabsTrigger>
            <TabsTrigger value="airtime">Airtime</TabsTrigger>
          </TabsList>

          <TabsContent value="data">
            <p className="text-center mb-4 text-gray-700 text-sm">All data valid for 30 days</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dataPlans.map((group, idx) => (
                <Card
                  key={idx}
                  className="overflow-hidden border-t-4"
                  style={{ borderTopColor: group.color || "#3b82f6" }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3 pb-2 border-b">
                      {group.logo && <img src={group.logo || "/placeholder.svg"} alt={group.network} className="h-6" />}
                      <h2 className="text-lg font-semibold">{group.network}</h2>
                    </div>
                    <ul className="space-y-2">
                      {group.plans.map((plan, i) => (
                        <li key={i} className="flex justify-between items-center py-1">
                          <span className="font-medium">
                            {plan.size} <span className="text-sm text-gray-500">₦{plan.price}</span>
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleFlutterwavePayment(plan.price, `${group.network} - ${plan.size}`)}
                            disabled={isLoading}
                          >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                            Buy
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="airtime">
            <Card>
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-4">Buy Airtime</h2>
                <div className="mb-4">
                  <Label htmlFor="amount">Enter Airtime Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="e.g. 1000"
                    value={airtimeAmount}
                    onChange={(e) => setAirtimeAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleFlutterwavePayment(Number(airtimeAmount), `Airtime - ₦${airtimeAmount}`)}
                  disabled={isLoading || !airtimeAmount}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Pay Now
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-10 p-4 bg-white rounded-lg shadow-sm">
          <p className="text-lg font-medium">For support, contact our customer care:</p>
          <p className="text-blue-600 text-xl mt-1">
            <a href={`tel:${customerCareLine}`} className="hover:underline">
              {customerCareLine}
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
