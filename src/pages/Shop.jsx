import "../styles/shop.css";

import mushroom from "../assets/oyster.jpg";

export default function Shop() {
return ( <div className="shop-page">


  {/* =========================
      HEADER
  ========================= */}

  <section className="shop-header">

    <div className="shop-header-content">

      <p className="shop-label">
        AGRIGOLD FARM
      </p>

      <h1>
        Fresh From Our Farm
      </h1>

      <p className="shop-subtitle">
        Premium dehydrated oyster mushrooms carefully
        processed using SmartChip drying technology.
      </p>

    </div>

  </section>


  {/* =========================
      SHOP STATUS
  ========================= */}

  <section className="shop-status-section">

    <div className="card shop-empty-state">

      <div className="empty-product-image">

        <img
          src={mushroom}
          alt="Agrigold Oyster Mushrooms"
        />

        <div className="image-overlay">
          <span>
            Currently Unavailable
          </span>
        </div>

      </div>


      <div className="empty-content">

        <div className="empty-icon">
          🌱
        </div>

        <p className="product-category">
          DEHYDRATED MUSHROOMS
        </p>

        <h2>
          No Products Available Yet
        </h2>

        <p>
          There are currently no dehydrated oyster
          mushroom batches available for reservation.
        </p>

        <p className="muted">
          Our next batch is currently being prepared.
          Please check back soon for freshly processed
          products from Agrigold Farm.
        </p>


        <div className="availability-message">

          <span className="availability-dot"></span>

          <span>
            Waiting for the next available batch
          </span>

        </div>

      </div>

    </div>

  </section>


  {/* =========================
      ABOUT THE PRODUCT
  ========================= */}

  <section className="card shop-section">

    <div className="section-heading">

      <p className="shop-label">
        OUR PRODUCT
      </p>

      <h2>
        About Our Dehydrated Mushrooms
      </h2>

    </div>


    <div className="product-about-grid">

      <div className="about-product-image">

        <img
          src={mushroom}
          alt="Dehydrated Oyster Mushrooms"
        />

      </div>


      <div className="about-product-content">

        <p>
          Agrigold Farm produces premium oyster mushrooms
          that are carefully processed to help preserve
          their flavor, aroma, and quality.
        </p>

        <p>
          Our mushrooms are prepared using controlled
          drying conditions through the SmartChip drying
          system.
        </p>


        <div className="product-info-grid">

          <div className="product-info-item">

            <h4>
              Product
            </h4>

            <p>
              Oyster Mushroom
            </p>

          </div>


          <div className="product-info-item">

            <h4>
              Type
            </h4>

            <p>
              Dehydrated Mushroom
            </p>

          </div>


          <div className="product-info-item">

            <h4>
              Ingredient
            </h4>

            <p>
              100% Oyster Mushroom
            </p>

          </div>


          <div className="product-info-item">

            <h4>
              Shelf Life
            </h4>

            <p>
              Up to 12 Months*
            </p>

          </div>

        </div>

      </div>

    </div>

  </section>


  {/* =========================
      SMARTCHIP DRYING
  ========================= */}

  <section className="card shop-section smartchip-section">

    <div className="section-heading">

      <p className="shop-label">
        SMARTCHIP TECHNOLOGY
      </p>

      <h2>
        Carefully Processed With SmartChip
      </h2>

      <p>
        SmartChip helps Agrigold Farm monitor and manage
        the mushroom drying environment using controlled
        technology.
      </p>

    </div>


    <div className="smartchip-features">

      <div className="smartchip-feature">

        <div className="feature-number">
          01
        </div>

        <h3>
          Temperature Monitoring
        </h3>

        <p>
          Sensors monitor the drying chamber to help
          maintain controlled drying conditions.
        </p>

      </div>


      <div className="smartchip-feature">

        <div className="feature-number">
          02
        </div>

        <h3>
          Humidity Monitoring
        </h3>

        <p>
          Humidity conditions are monitored throughout
          the drying process.
        </p>

      </div>


      <div className="smartchip-feature">

        <div className="feature-number">
          03
        </div>

        <h3>
          Controlled Drying
        </h3>

        <p>
          SmartChip manages the drying process to support
          consistent product quality.
        </p>

      </div>


      <div className="smartchip-feature">

        <div className="feature-number">
          04
        </div>

        <h3>
          Batch Monitoring
        </h3>

        <p>
          Drying batches can be monitored and recorded
          through the SmartChip system.
        </p>

      </div>

    </div>

  </section>


  {/* =========================
      RESERVATION AND DELIVERY
  ========================= */}

  <section className="card shop-section">

    <div className="section-heading">

      <p className="shop-label">
        HOW TO ORDER
      </p>

      <h2>
        Reservation & Delivery
      </h2>

      <p>
        Once products become available, customers will
        be able to reserve their preferred quantity
        directly through the Agrigold Farm shop.
      </p>

    </div>


    <div className="reservation-steps">

      <div className="reservation-step">

        <span>
          1
        </span>

        <h4>
          Select a Batch
        </h4>

        <p>
          Choose from available dehydrated mushroom
          batches.
        </p>

      </div>


      <div className="reservation-step">

        <span>
          2
        </span>

        <h4>
          Choose Quantity
        </h4>

        <p>
          Select the preferred product quantity based
          on available stock.
        </p>

      </div>


      <div className="reservation-step">

        <span>
          3
        </span>

        <h4>
          Submit Reservation
        </h4>

        <p>
          Provide your information and preferred
          delivery or pickup option.
        </p>

      </div>


      <div className="reservation-step">

        <span>
          4
        </span>

        <h4>
          Receive Confirmation
        </h4>

        <p>
          Agrigold Farm will review and confirm your
          reservation.
        </p>

      </div>

    </div>


    <div className="delivery-options">

      <div>

        <h3>
          Farm Pickup
        </h3>

        <p>
          Customers can arrange pickup directly from
          Agrigold Farm.
        </p>

      </div>


      <div>

        <h3>
          Local Delivery
        </h3>

        <p>
          Delivery options may be available depending
          on the customer's location.
        </p>

      </div>


      <div>

        <h3>
          Courier Delivery
        </h3>

        <p>
          Products may be shipped through available
          courier services.
        </p>

      </div>

    </div>

  </section>


  {/* =========================
      FAQ
  ========================= */}

  <section className="card shop-section">

    <div className="section-heading">

      <p className="shop-label">
        NEED HELP?
      </p>

      <h2>
        Frequently Asked Questions
      </h2>

    </div>


    <div className="faq-list">

      <div className="faq-item">

        <h4>
          How do I cook dehydrated mushrooms?
        </h4>

        <p>
          Soak the mushrooms in warm water for around
          10 to 15 minutes before cooking.
        </p>

      </div>


      <div className="faq-item">

        <h4>
          How should I store dehydrated mushrooms?
        </h4>

        <p>
          Store the product in a clean, dry, and sealed
          container away from moisture.
        </p>

      </div>


      <div className="faq-item">

        <h4>
          When can I reserve a product?
        </h4>

        <p>
          Reservations will become available once a
          dehydrated mushroom batch is listed in the
          shop.
        </p>

      </div>


      <div className="faq-item">

        <h4>
          How will I know when products are available?
        </h4>

        <p>
          Available batches will automatically appear
          in the Agrigold Farm shop.
        </p>

      </div>

    </div>

  </section>


  {/* =========================
      ABOUT AGRIGOLD FARM
  ========================= */}

  <section className="card shop-section about-farm-section">

    <div className="section-heading">

      <p className="shop-label">
        ABOUT AGRIGOLD
      </p>

      <h2>
        About Agrigold Farm
      </h2>

    </div>


    <p className="about-farm-text">

      Agrigold Farm specializes in producing
      high-quality oyster mushrooms using sustainable
      cultivation practices and modern processing
      technology.

    </p>


    <p className="about-farm-text">

      Through the SmartChip drying system, Agrigold Farm
      combines agriculture and technology to support a
      more controlled and monitored drying process for
      mushroom products.

    </p>

  </section>


  {/* =========================
      CONTACT
  ========================= */}

  <section className="card shop-section contact-section">

    <div className="section-heading">

      <p className="shop-label">
        CONTACT US
      </p>

      <h2>
        Contact Agrigold Farm
      </h2>

    </div>


    <div className="contact-grid">

      <div className="contact-item">

        <h4>
          Location
        </h4>

        <p>
          Victoria, Oriental Mindoro
        </p>

        <p>
          Philippines
        </p>

      </div>


      <div className="contact-item">

        <h4>
          Email
        </h4>

        <p>
          agrigoldfarm@email.com
        </p>

      </div>


      <div className="contact-item">

        <h4>
          Phone
        </h4>

        <p>
          +63 966 314 3255
        </p>

      </div>

    </div>

  </section>


  {/* =========================
      FOOTER MESSAGE
  ========================= */}

  <section className="shop-footer-message">

    <span className="footer-dot"></span>

    <p>
      Product availability will update when new batches
      are added to the Agrigold Farm inventory.
    </p>

  </section>

</div>


);
}
