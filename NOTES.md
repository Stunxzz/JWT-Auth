ПРОЕКТ: Платформа за онлайн търгове (Django DRF + React)

ГОТОВО:
- accounts app: AppUser (email login), JWT в HTTP-only cookies,
  register/login/logout/refresh/me, CookieJWTAuthentication
- auctions app:
  - Модели: Auction (status TextChoices, current_price денормализиран,
    DecimalField за пари), Bid (index на auction+created_at)
  - services.py: place_bid() с transaction.atomic + select_for_update
  - AuctionViewSet (ModelViewSet) + @action bid, IsSellerOrReadOnly
  - Сериализатори: AuctionSerializer, BidSerializer, BidCreateSerializer
- React: axios инстанция с cookie refresh, AuthContext, ProtectedRoute,
  Layout + Navbar, страници: списък / детайли+наддаване / създаване
- База: още на SQLite (select_for_update е no-op там)

СЛЕДВА:
1. Смяна на SQLite → PostgreSQL (само DATABASES настройката)
2. Celery + Redis: преходи draft→active (start_time) и
   active→ended + обявяване на победител (end_time)
3. (опц.) management command close_expired_auctions като стопгап
4. WebSockets (Channels) за real-time обновяване на цената
5. (опц.) лек list serializer без вложените bids