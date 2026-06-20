

const posts = [
  { id: "1", t: "10 Sustainable Shopping Habits for 2026", c: "Sustainability", d: "Jun 8, 2026", img: "https://picsum.photos/seed/post1/800/500", e: "Small changes that make a big difference for the planet \u2014 and your wallet." },
  { id: "2", t: "How Moom24 Vendors Tripled Sales in 6 Months", c: "Seller Success", d: "Jun 4, 2026", img: "https://picsum.photos/seed/post2/800/500", e: "Real stories from 5 sellers who scaled with our marketplace tools." },
  { id: "3", t: "The Ultimate Guide to Online Electronics Shopping", c: "Buying Guides", d: "May 30, 2026", img: "https://picsum.photos/seed/post3/800/500", e: "What to look for, how to spot fakes, and where to find the best deals." },
  { id: "4", t: "Behind the Scenes: A Day at Our Fulfillment Center", c: "Inside Moom24", d: "May 22, 2026", img: "https://picsum.photos/seed/post4/800/500", e: "From order to doorstep \u2014 how we deliver 200,000 packages daily." },
  { id: "5", t: "Top Fashion Trends from Local Designers", c: "Fashion", d: "May 18, 2026", img: "https://picsum.photos/seed/post5/800/500", e: "Discover emerging Bangladeshi designers redefining contemporary style." },
  { id: "6", t: "Smart Home Essentials Under \u09F35000", c: "Tech", d: "May 12, 2026", img: "https://picsum.photos/seed/post6/800/500", e: "Affordable upgrades that make life smarter and easier." }
];
function Blog() {


  return <div className="container-x py-10">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold">Moom24 Stories</h1>
        <p className="mt-2 text-muted-foreground">Insights, guides, and stories from our marketplace.</p>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {["All", "Sustainability", "Buying Guides", "Seller Success", "Fashion", "Tech", "Inside Moom24"].map((c, i) => <button key={c} className={`rounded-full px-4 py-2 text-sm font-semibold ${i === 0 ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>{c}</button>)}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => <article key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card card-hover">
            <img src={p.img} alt="" className="aspect-[16/10] w-full object-cover" />
            <div className="p-5">
              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">{p.c}</span>
                <span className="text-muted-foreground">{p.d}</span>
              </div>
              <h2 className="mt-3 font-display text-lg font-bold line-clamp-2">{p.t}</h2>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.e}</p>
              <a className="mt-3 inline-block text-sm font-semibold text-emerald-700 hover:underline">Read article →</a>
            </div>
          </article>)}
      </div>
    </div>;
}
export {
  Blog as default
};
