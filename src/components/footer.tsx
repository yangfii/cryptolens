export default function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-sm text-muted">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <div className="font-semibold text-foreground mb-1">CryptoLens</div>
            <div>AI-powered crypto research for spot traders.</div>
          </div>
          <div className="text-xs">
            <p>
              Data by{" "}
              <a
                href="https://www.coingecko.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                CoinGecko
              </a>
              {" • "}
              AI by{" "}
              <a
                href="https://www.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Anthropic Claude
              </a>
            </p>
            <p className="mt-2 max-w-md">
              Not financial advice. Always do your own research before trading.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
