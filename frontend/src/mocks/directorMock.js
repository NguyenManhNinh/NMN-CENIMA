// Mock data cho phân hệ Đạo diễn
// Sử dụng tạm thay cho API call

export const directorsMock = [
  {
    _id: 'd1',
    name: 'Christopher Nolan',
    slug: 'christopher-nolan',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Christopher_Nolan_Cannes_2018.jpg/440px-Christopher_Nolan_Cannes_2018.jpg',
    shortBio: 'Christopher Edward Nolan (sinh 30/07/1970) là đạo diễn, biên kịch và nhà sản xuất phim người Anh-Mỹ. Ông nổi tiếng với các bộ phim như The Dark Knight Trilogy, Inception, Interstellar và Oppenheimer.',
    fullBio: 'Christopher Edward Nolan sinh ngày 30 tháng 7 năm 1970, là đạo diễn, biên kịch và nhà sản xuất phim người Anh-Mỹ. Nổi tiếng với phong cách làm phim phức tạp về mặt cấu trúc và thị giác, Nolan đã trở thành một trong những đạo diễn thành công nhất về thương mại trong lịch sử điện ảnh. Các tác phẩm nổi bật của ông bao gồm Memento (2000), The Dark Knight Trilogy (2005-2012), Inception (2010), Interstellar (2014), Dunkirk (2017), Tenet (2020) và Oppenheimer (2023).',
    nationality: 'Mỹ',
    birthDate: '1970-07-30',
    birthPlace: 'London, Anh',
    height: '1.81m',
    viewCount: 15420,
    likeCount: 8234,
    createdAt: '2024-01-15',
    gallery: [
      { url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800', caption: 'On set' },
      { url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800', caption: 'Film premiere' }
    ],
    filmography: [
      { title: 'Oppenheimer', slug: 'oppenheimer', posterUrl: 'https://image.tmdb.org/t/p/w200/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', releaseDate: '2023-07-21', role: 'Đạo diễn' },
      { title: 'Tenet', slug: 'tenet', posterUrl: 'https://image.tmdb.org/t/p/w200/k68nPLbIST6NP96JmTxmZijEvCA.jpg', releaseDate: '2020-08-26', role: 'Đạo diễn' },
      { title: 'Dunkirk', slug: 'dunkirk', posterUrl: 'https://image.tmdb.org/t/p/w200/ebSnODDg9lbsMIaWg2uAbjn7TO5.jpg', releaseDate: '2017-07-21', role: 'Đạo diễn' },
      { title: 'Interstellar', slug: 'interstellar', posterUrl: 'https://image.tmdb.org/t/p/w200/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', releaseDate: '2014-11-07', role: 'Đạo diễn' },
      { title: 'Inception', slug: 'inception', posterUrl: 'https://image.tmdb.org/t/p/w200/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', releaseDate: '2010-07-16', role: 'Đạo diễn' }
    ]
  },
  {
    _id: 'd2',
    name: 'Quentin Tarantino',
    slug: 'quentin-tarantino',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Quentin_Tarantino_by_Gage_Skidmore.jpg/440px-Quentin_Tarantino_by_Gage_Skidmore.jpg',
    shortBio: 'Quentin Jerome Tarantino (sinh 27/03/1963) là đạo diễn, biên kịch và diễn viên người Mỹ. Phim của ông đặc trưng bởi phong cách kể chuyện phi tuyến tính và sử dụng bạo lực cách điệu hóa.',
    fullBio: 'Quentin Jerome Tarantino sinh ngày 27 tháng 3 năm 1963, là đạo diễn, biên kịch, nhà sản xuất và diễn viên người Mỹ. Các bộ phim của ông đặc trưng bởi cấu trúc phi tuyến tính, hội thoại sắc sảo, bạo lực cách điệu hóa và việc tham chiếu đến văn hóa đại chúng. Ông đã giành được nhiều giải thưởng bao gồm hai giải Oscar cho kịch bản gốc xuất sắc nhất.',
    nationality: 'Mỹ',
    birthDate: '1963-03-27',
    birthPlace: 'Knoxville, Tennessee, Mỹ',
    height: '1.85m',
    viewCount: 12350,
    likeCount: 6789,
    createdAt: '2024-02-10',
    gallery: [
      { url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800', caption: 'Film festival' }
    ],
    filmography: [
      { title: 'Once Upon a Time in Hollywood', slug: 'once-upon-a-time-in-hollywood', posterUrl: 'https://image.tmdb.org/t/p/w200/8j58iEBw9pOXFD2L0nt0ZXeHviB.jpg', releaseDate: '2019-07-26', role: 'Đạo diễn' },
      { title: 'The Hateful Eight', slug: 'the-hateful-eight', posterUrl: 'https://image.tmdb.org/t/p/w200/fqe8JxDNX6eiKFqZb9woMIV0Pc.jpg', releaseDate: '2015-12-25', role: 'Đạo diễn' },
      { title: 'Django Unchained', slug: 'django-unchained', posterUrl: 'https://image.tmdb.org/t/p/w200/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg', releaseDate: '2012-12-25', role: 'Đạo diễn' }
    ]
  },
  {
    _id: 'd3',
    name: 'Steven Spielberg',
    slug: 'steven-spielberg',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Steven_Spielberg_by_Gage_Skidmore.jpg/440px-Steven_Spielberg_by_Gage_Skidmore.jpg',
    shortBio: 'Steven Allan Spielberg (sinh 18/12/1946) là đạo diễn, nhà sản xuất và biên kịch người Mỹ. Ông là một trong những đạo diễn có ảnh hưởng và thành công nhất trong lịch sử điện ảnh.',
    fullBio: 'Steven Allan Spielberg sinh ngày 18 tháng 12 năm 1946, là đạo diễn, nhà sản xuất và biên kịch phim người Mỹ. Ông được coi là một trong những nhân vật sáng lập của thời kỳ New Hollywood và là đạo diễn thành công nhất về thương mại trong lịch sử. Các bộ phim của ông đã thu về hơn 10 tỷ USD trên toàn cầu.',
    nationality: 'Mỹ',
    birthDate: '1946-12-18',
    birthPlace: 'Cincinnati, Ohio, Mỹ',
    height: '1.72m',
    viewCount: 18900,
    likeCount: 9456,
    createdAt: '2024-01-05',
    gallery: [
      { url: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=800', caption: 'Behind the camera' },
      { url: 'https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=800', caption: 'Film set' },
      { url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800', caption: 'Premiere night' },
      { url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800', caption: 'Interview session' }
    ],
    filmography: [
      { title: 'The Fabelmans', slug: 'the-fabelmans', posterUrl: 'https://image.tmdb.org/t/p/w200/d6kOVeOuDdHD8FLo2y6k2cOIXB.jpg', releaseDate: '2022-11-11', role: 'Đạo diễn' },
      { title: 'West Side Story', slug: 'west-side-story', posterUrl: 'https://image.tmdb.org/t/p/w200/myLzfj3Vqjb4Hxuqd0g6JD8bN3s.jpg', releaseDate: '2021-12-10', role: 'Đạo diễn' }
    ]
  },
  {
    _id: 'd4',
    name: 'Denis Villeneuve',
    slug: 'denis-villeneuve',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Denis_Villeneuve_by_Gage_Skidmore.jpg/440px-Denis_Villeneuve_by_Gage_Skidmore.jpg',
    shortBio: 'Denis Villeneuve (sinh 03/10/1967) là đạo diễn và nhà biên kịch người Canada gốc Pháp. Ông nổi tiếng với các bộ phim khoa học viễn tưởng như Arrival, Blade Runner 2049 và Dune.',
    fullBio: 'Denis Villeneuve sinh ngày 3 tháng 10 năm 1967, là đạo diễn, nhà sản xuất và biên kịch phim người Canada gốc Pháp. Ông được biết đến với các bộ phim mang tính nghệ thuật cao và thị giác ấn tượng. Các tác phẩm nổi bật bao gồm Sicario (2015), Arrival (2016), Blade Runner 2049 (2017), Dune (2021) và Dune: Part Two (2024).',
    nationality: 'Canada',
    birthDate: '1967-10-03',
    birthPlace: 'Trois-Rivières, Quebec, Canada',
    height: '1.78m',
    viewCount: 11200,
    likeCount: 5678,
    createdAt: '2024-03-01',
    gallery: [
      { url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800', caption: 'Dune premiere' },
      { url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800', caption: 'Interview' },
      { url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800', caption: 'Film set' }
    ],
    filmography: [
      { title: 'Dune: Part Two', slug: 'dune-part-two', posterUrl: 'https://image.tmdb.org/t/p/w200/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', releaseDate: '2024-03-01', role: 'Đạo diễn' },
      { title: 'Dune', slug: 'dune', posterUrl: 'https://image.tmdb.org/t/p/w200/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', releaseDate: '2021-10-22', role: 'Đạo diễn' },
      { title: 'Blade Runner 2049', slug: 'blade-runner-2049', posterUrl: 'https://image.tmdb.org/t/p/w200/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', releaseDate: '2017-10-06', role: 'Đạo diễn' }
    ]
  },
  {
    _id: 'd5',
    name: 'Bong Joon-ho',
    slug: 'bong-joon-ho',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Bong_Joon-ho_2017.jpg/440px-Bong_Joon-ho_2017.jpg',
    shortBio: 'Bong Joon-ho (sinh 14/09/1969) là đạo diễn, biên kịch và nhà sản xuất phim người Hàn Quốc. Ông nổi tiếng với Parasite - bộ phim đầu tiên không nói tiếng Anh giành Oscar Phim hay nhất.',
    fullBio: 'Bong Joon-ho sinh ngày 14 tháng 9 năm 1969, là đạo diễn, biên kịch và nhà sản xuất phim người Hàn Quốc. Phim của ông thường kết hợp các yếu tố xã hội và hài hước đen. Parasite (2019) đã làm nên lịch sử khi trở thành bộ phim đầu tiên không nói tiếng Anh giành giải Oscar Phim hay nhất.',
    nationality: 'Hàn Quốc',
    birthDate: '1969-09-14',
    birthPlace: 'Daegu, Hàn Quốc',
    height: '1.82m',
    viewCount: 9800,
    likeCount: 4567,
    createdAt: '2024-02-20',
    gallery: [
      { url: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800', caption: 'Oscar ceremony' }
    ],
    filmography: [
      { title: 'Parasite', slug: 'parasite', posterUrl: 'https://image.tmdb.org/t/p/w200/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', releaseDate: '2019-05-30', role: 'Đạo diễn' },
      { title: 'Okja', slug: 'okja', posterUrl: 'https://image.tmdb.org/t/p/w200/tT4uH5iqOYUHwNzaUxWvT8N9pZm.jpg', releaseDate: '2017-06-28', role: 'Đạo diễn' },
      { title: 'Snowpiercer', slug: 'snowpiercer', posterUrl: 'https://image.tmdb.org/t/p/w200/nzccFr8EL8neQmk3u4rYbxEQC0d.jpg', releaseDate: '2013-08-01', role: 'Đạo diễn' }
    ]
  },
  {
    _id: 'd6',
    name: 'Martin Scorsese',
    slug: 'martin-scorsese',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Martin_Scorsese_at_the_2024_Berlin_Film_Festival.jpg/440px-Martin_Scorsese_at_the_2024_Berlin_Film_Festival.jpg',
    shortBio: 'Martin Charles Scorsese (sinh 17/11/1942) là đạo diễn, nhà sản xuất, biên kịch và diễn viên người Mỹ gốc Ý. Ông là một biểu tượng của điện ảnh Mỹ với hơn 50 năm sự nghiệp.',
    fullBio: 'Martin Charles Scorsese sinh ngày 17 tháng 11 năm 1942, là một trong những đạo diễn vĩ đại nhất trong lịch sử điện ảnh. Các bộ phim của ông thường khám phá các chủ đề về tội phạm, đạo đức và bản sắc Mỹ-Ý. Các tác phẩm kinh điển bao gồm Taxi Driver, Goodfellas, The Departed và gần đây là Killers of the Flower Moon.',
    nationality: 'Mỹ',
    birthDate: '1942-11-17',
    birthPlace: 'New York City, Mỹ',
    height: '1.63m',
    viewCount: 14500,
    likeCount: 7890,
    createdAt: '2024-01-20',
    gallery: [],
    filmography: [
      { title: 'Killers of the Flower Moon', slug: 'killers-of-the-flower-moon', posterUrl: 'https://image.tmdb.org/t/p/w200/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg', releaseDate: '2023-10-20', role: 'Đạo diễn' },
      { title: 'The Irishman', slug: 'the-irishman', posterUrl: 'https://image.tmdb.org/t/p/w200/mbm8k3GFhXS0ROd9AD1gqYbIFbM.jpg', releaseDate: '2019-11-27', role: 'Đạo diễn' }
    ]
  },
  {
    _id: 'd7',
    name: 'Greta Gerwig',
    slug: 'greta-gerwig',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Greta_Gerwig_Berlinale_2018.jpg/440px-Greta_Gerwig_Berlinale_2018.jpg',
    shortBio: 'Greta Celeste Gerwig (sinh 04/08/1983) là đạo diễn, biên kịch và diễn viên người Mỹ. Bộ phim Barbie của cô đã trở thành bộ phim do nữ đạo diễn đạt doanh thu cao nhất mọi thời đại.',
    fullBio: 'Greta Celeste Gerwig sinh ngày 4 tháng 8 năm 1983, là đạo diễn, biên kịch và diễn viên người Mỹ. Cô bắt đầu sự nghiệp như một diễn viên trong các bộ phim độc lập trước khi chuyển sang đạo diễn. Lady Bird (2017) và Little Women (2019) đều được đề cử Oscar. Barbie (2023) đã phá vỡ nhiều kỷ lục phòng vé.',
    nationality: 'Mỹ',
    birthDate: '1983-08-04',
    birthPlace: 'Sacramento, California, Mỹ',
    height: '1.75m',
    viewCount: 8900,
    likeCount: 5234,
    createdAt: '2024-03-15',
    gallery: [
      { url: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800', caption: 'Barbie premiere' },
      { url: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=800', caption: 'Award show' }
    ],
    filmography: [
      { title: 'Barbie', slug: 'barbie', posterUrl: 'https://image.tmdb.org/t/p/w200/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', releaseDate: '2023-07-21', role: 'Đạo diễn' },
      { title: 'Little Women', slug: 'little-women', posterUrl: 'https://image.tmdb.org/t/p/w200/yn5ihODtZ7ofn8pDYfxCmxh8AXI.jpg', releaseDate: '2019-12-25', role: 'Đạo diễn' },
      { title: 'Lady Bird', slug: 'lady-bird', posterUrl: 'https://image.tmdb.org/t/p/w200/iySFtKLrWvVzXzlFj7x1zalxi5G.jpg', releaseDate: '2017-11-03', role: 'Đạo diễn' }
    ]
  },
  {
    _id: 'd8',
    name: 'James Cameron',
    slug: 'james-cameron',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/James_Cameron_by_Gage_Skidmore.jpg/440px-James_Cameron_by_Gage_Skidmore.jpg',
    shortBio: 'James Francis Cameron (sinh 16/08/1954) là đạo diễn, nhà sản xuất và biên kịch người Canada. Hai bộ phim của ông - Titanic và Avatar - nằm trong top 3 phim có doanh thu cao nhất mọi thời đại.',
    fullBio: 'James Francis Cameron sinh ngày 16 tháng 8 năm 1954, là đạo diễn, nhà sản xuất, biên kịch và biên tập phim người Canada. Ông nổi tiếng với các bộ phim bom tấn sử dụng công nghệ tiên tiến. Titanic (1997) và Avatar (2009) đều giữ kỷ lục phim có doanh thu cao nhất thế giới tại thời điểm ra mắt.',
    nationality: 'Canada',
    birthDate: '1954-08-16',
    birthPlace: 'Kapuskasing, Ontario, Canada',
    height: '1.88m',
    viewCount: 16700,
    likeCount: 8901,
    createdAt: '2024-01-10',
    gallery: [
      { url: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800', caption: 'Avatar premiere' }
    ],
    filmography: [
      { title: 'Avatar: The Way of Water', slug: 'avatar-the-way-of-water', posterUrl: 'https://image.tmdb.org/t/p/w200/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg', releaseDate: '2022-12-16', role: 'Đạo diễn' },
      { title: 'Avatar', slug: 'avatar', posterUrl: 'https://image.tmdb.org/t/p/w200/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg', releaseDate: '2009-12-18', role: 'Đạo diễn' },
      { title: 'Titanic', slug: 'titanic', posterUrl: 'https://image.tmdb.org/t/p/w200/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg', releaseDate: '1997-12-19', role: 'Đạo diễn' }
    ]
  },
  {
    _id: 'd9',
    name: 'Trần Anh Hùng',
    slug: 'tran-anh-hung',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Tran_Anh_Hung_Cannes_2023.jpg/440px-Tran_Anh_Hung_Cannes_2023.jpg',
    shortBio: 'Trần Anh Hùng (sinh 23/12/1962) là đạo diễn và biên kịch người Pháp gốc Việt. Ông đã giành giải Đạo diễn xuất sắc nhất tại Cannes 2023 với phim The Taste of Things.',
    fullBio: 'Trần Anh Hùng sinh ngày 23 tháng 12 năm 1962 tại Việt Nam, là đạo diễn và biên kịch phim người Pháp gốc Việt. Ông nổi tiếng với phong cách làm phim tinh tế và thơ mộng. Các tác phẩm nổi bật bao gồm Mùi Đu Đủ Xanh (1993), Xích Lô (1995), và The Taste of Things (2023) - bộ phim giúp ông giành giải Đạo diễn xuất sắc nhất tại LHP Cannes.',
    nationality: 'Việt Nam',
    birthDate: '1962-12-23',
    birthPlace: 'Đà Nẵng, Việt Nam',
    height: '1.70m',
    viewCount: 5600,
    likeCount: 3456,
    createdAt: '2024-04-01',
    gallery: [
      { url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800', caption: 'Cannes 2023' }
    ],
    filmography: [
      { title: 'The Taste of Things', slug: 'the-taste-of-things', posterUrl: 'https://image.tmdb.org/t/p/w200/9HdqS7DOqVcQzYHpz0VzTZ9lXel.jpg', releaseDate: '2023-12-13', role: 'Đạo diễn' },
      { title: 'Mùi Đu Đủ Xanh', slug: 'mui-du-du-xanh', posterUrl: 'https://image.tmdb.org/t/p/w200/5DQe4q0e6u7hs3IJw1fNFq2Rp0r.jpg', releaseDate: '1993-06-08', role: 'Đạo diễn' }
    ]
  },
  {
    _id: 'd10',
    name: 'Park Chan-wook',
    slug: 'park-chan-wook',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Park_Chan-wook_2023.jpg/440px-Park_Chan-wook_2023.jpg',
    shortBio: 'Park Chan-wook (sinh 23/08/1963) là đạo diễn và biên kịch người Hàn Quốc. Ông nổi tiếng với Vengeance Trilogy và đã giành giải Đạo diễn xuất sắc nhất tại Cannes 2022.',
    fullBio: 'Park Chan-wook sinh ngày 23 tháng 8 năm 1963, là đạo diễn, biên kịch và nhà sản xuất phim người Hàn Quốc. Ông nổi tiếng với phong cách làm phim đậm chất thẩm mỹ và các câu chuyện về sự trả thù. Vengeance Trilogy (Sympathy for Mr. Vengeance, Oldboy, Lady Vengeance) là những tác phẩm kinh điển của điện ảnh Hàn Quốc.',
    nationality: 'Hàn Quốc',
    birthDate: '1963-08-23',
    birthPlace: 'Seoul, Hàn Quốc',
    height: '1.76m',
    viewCount: 7800,
    likeCount: 4123,
    createdAt: '2024-02-28',
    gallery: [
      { url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800', caption: 'Film premiere' }
    ],
    filmography: [
      { title: 'Decision to Leave', slug: 'decision-to-leave', posterUrl: 'https://image.tmdb.org/t/p/w200/vK6NpP0ggPKJH9hWfJjOKkWyJBF.jpg', releaseDate: '2022-06-29', role: 'Đạo diễn' },
      { title: 'The Handmaiden', slug: 'the-handmaiden', posterUrl: 'https://image.tmdb.org/t/p/w200/dLlH4aNHdnmR3hH2aVn5Xo6l6tr.jpg', releaseDate: '2016-06-01', role: 'Đạo diễn' },
      { title: 'Oldboy', slug: 'oldboy', posterUrl: 'https://image.tmdb.org/t/p/w200/pWDtjs568ZfOTMbURQBYuT4Qxka.jpg', releaseDate: '2003-11-21', role: 'Đạo diễn' }
    ]
  },
  {
    _id: 'd11',
    name: 'Ridley Scott',
    slug: 'ridley-scott',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ridley_Scott_2023.jpg/440px-Ridley_Scott_2023.jpg',
    shortBio: 'Sir Ridley Scott (sinh 30/11/1937) là đạo diễn và nhà sản xuất phim người Anh. Ông là người tạo ra các bộ phim kinh điển như Alien, Blade Runner và Gladiator.',
    fullBio: 'Sir Ridley Scott sinh ngày 30 tháng 11 năm 1937, là đạo diễn và nhà sản xuất phim người Anh. Với sự nghiệp kéo dài hơn 50 năm, ông đã tạo ra nhiều bộ phim có ảnh hưởng lớn đến điện ảnh thế giới bao gồm Alien (1979), Blade Runner (1982), Thelma & Louise (1991), Gladiator (2000) và The Martian (2015).',
    nationality: 'Anh',
    birthDate: '1937-11-30',
    birthPlace: 'South Shields, Anh',
    height: '1.74m',
    viewCount: 13400,
    likeCount: 6789,
    createdAt: '2024-01-25',
    gallery: [],
    filmography: [
      { title: 'Napoleon', slug: 'napoleon', posterUrl: 'https://image.tmdb.org/t/p/w200/jE5o7y9K6pZtWNNMEw3IdpHuncR.jpg', releaseDate: '2023-11-22', role: 'Đạo diễn' },
      { title: 'Gladiator II', slug: 'gladiator-ii', posterUrl: 'https://image.tmdb.org/t/p/w200/2cxhvwyEwRlysAmDuPFa2j9XnT1.jpg', releaseDate: '2024-11-22', role: 'Đạo diễn' }
    ]
  },
  {
    _id: 'd12',
    name: 'Wes Anderson',
    slug: 'wes-anderson',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Wes_Anderson_2023.jpg/440px-Wes_Anderson_2023.jpg',
    shortBio: 'Wesley Wales Anderson (sinh 01/05/1969) là đạo diễn, biên kịch và nhà sản xuất phim người Mỹ. Phim của ông đặc trưng bởi phong cách hình ảnh đối xứng và bảng màu pastel độc đáo.',
    fullBio: 'Wesley Wales Anderson sinh ngày 1 tháng 5 năm 1969, là đạo diễn, biên kịch và nhà sản xuất phim người Mỹ. Các bộ phim của ông có phong cách thị giác độc đáo với bố cục đối xứng, bảng màu pastel và typography đặc trưng. Các tác phẩm nổi bật bao gồm The Royal Tenenbaums, The Grand Budapest Hotel, Isle of Dogs và Asteroid City.',
    nationality: 'Mỹ',
    birthDate: '1969-05-01',
    birthPlace: 'Houston, Texas, Mỹ',
    height: '1.80m',
    viewCount: 9200,
    likeCount: 5678,
    createdAt: '2024-03-10',
    gallery: [
      { url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800', caption: 'Cannes' },
      { url: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800', caption: 'Film set' }
    ],
    filmography: [
      { title: 'Asteroid City', slug: 'asteroid-city', posterUrl: 'https://image.tmdb.org/t/p/w200/tcKBclNUdkas4Jis8KcHGpW3ngl.jpg', releaseDate: '2023-06-23', role: 'Đạo diễn' },
      { title: 'The French Dispatch', slug: 'the-french-dispatch', posterUrl: 'https://image.tmdb.org/t/p/w200/jv7WRFxHAnhmYj7C00dCPF8rTqM.jpg', releaseDate: '2021-10-22', role: 'Đạo diễn' },
      { title: 'The Grand Budapest Hotel', slug: 'the-grand-budapest-hotel', posterUrl: 'https://image.tmdb.org/t/p/w200/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg', releaseDate: '2014-03-28', role: 'Đạo diễn' }
    ]
  }
];

// Mock phim đang chiếu cho sidebar
export const nowShowingMoviesMock = [
  {
    _id: 'm1',
    title: 'Hai Bà Chủ',
    slug: 'hai-ba-chu',
    posterUrl: 'https://image.tmdb.org/t/p/w300/zTxHf9iIOCqRbxvl8W5QYKrsMLq.jpg',
    rating: 6.5,
    ageRating: 'C18'
  },
  {
    _id: 'm2',
    title: 'Spongebob: Lời Nguyền Hải Tặc 2',
    slug: 'spongebob-loi-nguyen-hai-tac-2',
    posterUrl: 'https://image.tmdb.org/t/p/w300/xedqoLk34PNbmDxzQYbv0t3MKTA.jpg',
    rating: 8.4,
    ageRating: 'P'
  },
  {
    _id: 'm3',
    title: 'Phi Vụ Động Trời 2',
    slug: 'phi-vu-dong-troi-2',
    posterUrl: 'https://image.tmdb.org/t/p/w300/7IJ7F8tX7IAkpUdaGovOBJqORnJ.jpg',
    rating: 6.5,
    ageRating: 'C18'
  },
  {
    _id: 'm4',
    title: 'Oppenheimer',
    slug: 'oppenheimer',
    posterUrl: 'https://image.tmdb.org/t/p/w300/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    rating: 8.9,
    ageRating: 'C16'
  },
  {
    _id: 'm5',
    title: 'Dune: Part Two',
    slug: 'dune-part-two',
    posterUrl: 'https://image.tmdb.org/t/p/w300/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    rating: 8.5,
    ageRating: 'C13'
  }
];

// Helper: Lấy danh sách quốc tịch unique từ directorsMock
export const getDirectorNationalities = () => {
  const nationalities = [...new Set(directorsMock.map(d => d.nationality).filter(Boolean))];
  return nationalities.sort((a, b) => a.localeCompare(b, 'vi'));
};

// Helper: Deep clone một director object để tránh mutation global
const cloneDirector = (director) => {
  if (!director) return null;
  return {
    ...director,
    gallery: director.gallery ? director.gallery.map(g => ({ ...g })) : [],
    filmography: director.filmography ? director.filmography.map(f => ({ ...f })) : []
  };
};

// Helper: Lấy director theo slug - trả về clone để tránh mutation
export const getDirectorBySlug = (slug) => {
  const director = directorsMock.find(d => d.slug === slug);
  return cloneDirector(director);
};

// Helper: Lọc và phân trang directors - trả về list clone
export const getDirectorsPaginated = ({ page = 1, limit = 10, sort = '-viewCount', nationality = '' }) => {
  let filtered = [...directorsMock];

  // Filter by nationality
  if (nationality) {
    filtered = filtered.filter(d => d.nationality === nationality);
  }

  // Sort - Chuẩn hóa: sortOrder = -1 là DESC
  const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
  const sortOrder = sort.startsWith('-') ? -1 : 1;

  filtered.sort((a, b) => {
    let valA, valB;

    if (sortField === 'viewCount') {
      valA = a.viewCount ?? 0;
      valB = b.viewCount ?? 0;
    } else if (sortField === 'likeCount') {
      valA = a.likeCount ?? 0;
      valB = b.likeCount ?? 0;
    } else if (sortField === 'createdAt') {
      valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    } else {
      return 0;
    }

    // (valA - valB) * sortOrder:
    // - DESC (sortOrder=-1): (valA - valB) * (-1) = valB - valA ✓
    // - ASC (sortOrder=1): (valA - valB) * 1 = valA - valB ✓
    return (valA - valB) * sortOrder;
  });

  // Pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const data = filtered.slice(startIndex, startIndex + limit).map(cloneDirector);

  return {
    data,
    total,
    totalPages,
    currentPage: page
  };
};
