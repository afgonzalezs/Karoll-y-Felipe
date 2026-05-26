import AnimatedSection from "../AnimatedSection";

export default function LoveStorySection({ story }) {
  return (
    <AnimatedSection id="historia" className="container">
      <h2>Nuestra historia de amor</h2>
      <div className="story-copy">
        {story.paragraphs.map((paragraph) => (
          <p key={paragraph} className="story-paragraph">
            {paragraph}
          </p>
        ))}
      </div>

      {story.thingsWeAre?.length > 0 && (
        <div className="our-things">
          <h3>Lo que somos</h3>
          <div className="things-grid">
            {story.thingsWeAre.map((thing) => (
              <div key={thing.title} className="thing-card">
                {thing.img
                  ? <img src={thing.img} alt={thing.title} className="thing-img" />
                  : <span className="thing-icon">{thing.icon}</span>
                }
                <h4>{thing.title}</h4>
                <p>{thing.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </AnimatedSection>
  );
}
