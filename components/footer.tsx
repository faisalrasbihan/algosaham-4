import Link from "next/link"
import { Twitter, Github, Linkedin, Mail } from "lucide-react"

export function Footer() {
    return (
        <footer className="relative z-20 border-t border-border bg-background">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="min-w-0 space-y-4">
                        <Link href="/" className="text-2xl font-bold">
                            <span style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                                algosaham<span className="text-ochre">.ai</span>
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground font-mono">
                            Platform algotrading #1 di Indonesia
                        </p>
                    </div>

                    {/* Product Links */}
                    <div className="min-w-0 space-y-4">
                        <h3 className="font-semibold text-foreground">Product</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/features" className="relative z-10 inline-flex pointer-events-auto text-muted-foreground transition-colors hover:text-primary">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/harga" className="relative z-10 inline-flex pointer-events-auto text-muted-foreground transition-colors hover:text-primary">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/strategies" className="relative z-10 inline-flex pointer-events-auto text-muted-foreground transition-colors hover:text-primary">
                                    Strategies
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div className="min-w-0 space-y-4">
                        <h3 className="font-semibold text-foreground">Support</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/help" className="relative z-10 inline-flex pointer-events-auto text-muted-foreground transition-colors hover:text-primary">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="relative z-10 inline-flex pointer-events-auto text-muted-foreground transition-colors hover:text-primary">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/syarat-ketentuan" className="relative z-10 inline-flex pointer-events-auto text-muted-foreground transition-colors hover:text-primary">
                                    Syarat & Ketentuan
                                </Link>
                            </li>
                            <li>
                                <Link href="/status" className="relative z-10 inline-flex pointer-events-auto text-muted-foreground transition-colors hover:text-primary">
                                    System Status
                                </Link>
                                </li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div className="min-w-0 space-y-4">
                        <h3 className="font-semibold text-foreground">Company</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/about" className="relative z-10 inline-flex pointer-events-auto text-muted-foreground transition-colors hover:text-primary">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="relative z-10 inline-flex pointer-events-auto text-muted-foreground transition-colors hover:text-primary">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="relative z-10 inline-flex pointer-events-auto text-muted-foreground transition-colors hover:text-primary">
                                    Careers
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground font-mono">
                        © {new Date().getFullYear()} algosaham.ai. All rights reserved.
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative z-10 inline-flex pointer-events-auto text-muted-foreground transition-colors hover:text-primary"
                        >
                            <Twitter className="h-5 w-5" />
                            <span className="sr-only">Twitter</span>
                        </Link>
                        <Link
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative z-10 inline-flex pointer-events-auto text-muted-foreground transition-colors hover:text-primary"
                        >
                            <Github className="h-5 w-5" />
                            <span className="sr-only">GitHub</span>
                        </Link>
                        <Link
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative z-10 inline-flex pointer-events-auto text-muted-foreground transition-colors hover:text-primary"
                        >
                            <Linkedin className="h-5 w-5" />
                            <span className="sr-only">LinkedIn</span>
                        </Link>
                        <Link
                            href="/help"
                            className="relative z-10 inline-flex pointer-events-auto text-muted-foreground transition-colors hover:text-primary"
                        >
                            <Mail className="h-5 w-5" />
                            <span className="sr-only">Email</span>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
