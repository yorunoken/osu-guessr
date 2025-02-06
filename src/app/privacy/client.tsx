"use client";

import { useTranslationsContext } from "@/context/translations-provider";

export default function PrivacyPolicy() {
    const { t } = useTranslationsContext();

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">{t.privacy.title}</h1>

            <div className="space-y-8">
                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-4">{t.privacy.sections.dataCollection.title}</h2>
                    <div className="space-y-4 text-foreground/80">
                        <p>{t.privacy.sections.dataCollection.description}</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>{t.privacy.sections.dataCollection.items.profile}</li>
                            <li>{t.privacy.sections.dataCollection.items.stats}</li>
                            <li>{t.privacy.sections.dataCollection.items.session}</li>
                        </ul>
                    </div>
                </section>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-4">{t.privacy.sections.dataUsage.title}</h2>
                    <div className="space-y-4 text-foreground/80">
                        <p>{t.privacy.sections.dataUsage.description}</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>{t.privacy.sections.dataUsage.items.progress}</li>
                            <li>{t.privacy.sections.dataUsage.items.leaderboards}</li>
                            <li>{t.privacy.sections.dataUsage.items.improvement}</li>
                        </ul>
                    </div>
                </section>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-4">{t.privacy.sections.dataProtection.title}</h2>
                    <div className="space-y-4 text-foreground/80">
                        <p>{t.privacy.sections.dataProtection.description}</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>{t.privacy.sections.dataProtection.items.encryption}</li>
                            <li>{t.privacy.sections.dataProtection.items.updates}</li>
                            <li>{t.privacy.sections.dataProtection.items.access}</li>
                        </ul>
                    </div>
                </section>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-4">{t.privacy.sections.thirdParty.title}</h2>
                    <div className="space-y-4 text-foreground/80">
                        <p>{t.privacy.sections.thirdParty.description}</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>{t.privacy.sections.thirdParty.items.osu}</li>
                            <li>{t.privacy.sections.thirdParty.items.analytics}</li>
                            <li>{t.privacy.sections.thirdParty.items.cdn}</li>
                        </ul>
                    </div>
                </section>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-4">{t.privacy.sections.dataRetention.title}</h2>
                    <div className="space-y-4 text-foreground/80">
                        <p>{t.privacy.sections.dataRetention.description}</p>
                        <p>{t.privacy.sections.dataRetention.gameStats}</p>
                    </div>
                </section>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-4">{t.privacy.sections.rights.title}</h2>
                    <div className="space-y-4 text-foreground/80">
                        <p>{t.privacy.sections.rights.description}</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>{t.privacy.sections.rights.items.access}</li>
                            <li>{t.privacy.sections.rights.items.correction}</li>
                            <li>{t.privacy.sections.rights.items.objection}</li>
                            <li>{t.privacy.sections.rights.items.export}</li>
                        </ul>
                    </div>
                </section>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-4">{t.privacy.sections.contact.title}</h2>
                    <div className="space-y-4 text-foreground/80">
                        <p>{t.privacy.sections.contact.description}</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>{t.privacy.sections.contact.items.email}</li>
                            <li>{t.privacy.sections.contact.items.discord}</li>
                            <li>
                                {t.privacy.sections.contact.items.github}{" "}
                                <a href="https://github.com/yorunoken/osu-guessr" className="text-primary hover:underline">
                                    osu-guessr
                                </a>
                            </li>
                        </ul>
                    </div>
                </section>

                <section className="bg-card rounded-xl p-8 border border-border/50">
                    <h2 className="text-2xl font-semibold mb-4">{t.privacy.sections.ezoic.title}</h2>
                    <div className="space-y-4 text-foreground/80">
                        <span id="ezoic-privacy-policy-embed"></span>
                    </div>
                    <div className="space-y-4 text-foreground/80">
                        <p>{t.privacy.sections.ezoic.description}</p>

                        <p>{t.privacy.sections.ezoic.cookies.description}</p>
                        <p>
                            {t.privacy.sections.ezoic.cookies.note}{" "}
                            <a href="https://allaboutcookies.org/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                {t.privacy.sections.ezoic.cookies.link.text}
                            </a>
                            .
                        </p>

                        <p className="font-semibold">{t.privacy.sections.ezoic.dataCollection.title}</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>{t.privacy.sections.ezoic.dataCollection.items.ip}</li>
                            <li>{t.privacy.sections.ezoic.dataCollection.items.os}</li>
                            <li>{t.privacy.sections.ezoic.dataCollection.items.device}</li>
                            <li>{t.privacy.sections.ezoic.dataCollection.items.language}</li>
                            <li>{t.privacy.sections.ezoic.dataCollection.items.browser}</li>
                            <li>{t.privacy.sections.ezoic.dataCollection.items.email}</li>
                        </ul>

                        <p>{t.privacy.sections.ezoic.partners.description}</p>
                        <p>
                            <a href="https://youradchoices.com/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                {t.privacy.sections.ezoic.partners.links.iba.text}
                            </a>
                            .{" "}
                            <a href="https://ezoic.com/privacy/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                {t.privacy.sections.ezoic.partners.links.privacy.text}
                            </a>
                            , {t.privacy.sections.ezoic.partners.links.partners.prefix}{" "}
                            <a href="https://www.ezoic.com/privacy-policy/advertising-partners/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                {t.privacy.sections.ezoic.partners.links.partners.text}
                            </a>
                            .
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
