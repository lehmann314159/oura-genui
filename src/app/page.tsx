'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { UIRenderer, parseUIComponents } from '@/components/oura/UIRenderer'
import { Send, Loader2, Moon } from 'lucide-react'

// Helper to extract text content from message parts
function getMessageText(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((part) => part.type === 'text' && part.text)
    .map((part) => part.text)
    .join('')
}

export default function Home() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status } = useChat()

  const isLoading = status === 'streaming' || status === 'submitted'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const message = input
    setInput('')
    await sendMessage({ text: message })
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-2 px-4">
          <Moon className="h-5 w-5" />
          <h1 className="font-semibold">Oura Health Assistant</h1>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 container max-w-3xl px-4 py-4">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="flex flex-col gap-4 pb-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Moon className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Welcome to Oura Health Assistant</h2>
                <p className="text-muted-foreground max-w-md">
                  Ask me about your sleep, activity, readiness, or any health data from your Oura Ring.
                </p>
                <div className="flex flex-wrap gap-2 mt-6 justify-center">
                  {[
                    'How did I sleep last night?',
                    "What's my readiness score?",
                    'Show my activity today',
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => {
              const content = getMessageText(message.parts as Array<{ type: string; text?: string }>)
              const uiComponents = message.role === 'assistant'
                ? parseUIComponents(content)
                : []

              // Remove the JSON block from the displayed text
              const textContent = content.replace(/```json[\s\S]*?```/g, '').trim()

              return (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2'
                        : 'space-y-4'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p>{content}</p>
                    ) : (
                      <>
                        {textContent && (
                          <Card className="p-4">
                            <p className="whitespace-pre-wrap">{textContent}</p>
                          </Card>
                        )}
                        {uiComponents.length > 0 && (
                          <UIRenderer components={uiComponents} />
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="flex justify-start">
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing your data...</span>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      {/* Input Area */}
      <footer className="sticky bottom-0 border-t bg-background p-4">
        <form
          onSubmit={handleSubmit}
          className="container max-w-3xl flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your health data..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </footer>
    </div>
  )
}
