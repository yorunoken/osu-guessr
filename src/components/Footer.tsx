export default function Footer() {
    return (
        <footer className="bg-secondary py-6">
            <div className="container mx-auto px-4 text-center">
                <p className="text-lg text-foreground/80">
                    Made with ❤️ by{" "}
                    <a className="text-primary hover:text-primary/80 transition-colors duration-200" href="https://osu.ppy.sh/u/yorunoken" target="_blank" rel="noopener noreferrer">
                        yorunoken
                    </a>
                </p>
                <p className="mt-3 text-sm text-foreground/50">Not affiliated with osu!</p>
            </div>
        </footer>
    );
}
