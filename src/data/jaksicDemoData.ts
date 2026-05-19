import { 
  ImportedProfileRow, ImportedCommentRow, ExtractedNarrative, 
  ConversationThread, ReviewFlag, Client, NetworkNode, NetworkEdge 
} from '../types';

export const JAKSIC_PROFILES: ImportedProfileRow[] = [
  {
    "profile_pic_url": "https://scontent-bos5-1.cdninstagram.com/v/t51.82787-19/657853739_18573159067059165_2335490471433344788_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=109&_nc_oc=Q6cZ2gFl55E7M6HgQpw0-fdwPoTOVkrMuQgnxJ2KdMGfP2sTX9lVkfPx4vaygdNrL-kymUU&_nc_ohc=DJwPAjdi_rQQ7kNvwFqXyjr&_nc_gid=D-agiJZY2hIGCSsSev9kCA&edm=AHUBisUBAAAA&ccb=7-5&ig_cache_key=GCsNNifdg4yUMPxBABQXGLY1VGkgbmNDAQAB1501500j-ccb7-5&oh=00_Af03Vvy46Btb_kWZEWP3kJ2adfjU-zpzY-hYdTAlLkKogg&oe=69EFA88B&_nc_sid=bc52df",
    "full_name": "Marko Andjelkovic",
    "username": "lukin_i_maksimov_tata",
    "is_private": true,
    "is_verified": false,
    "is_new": true,
    "latest_reel_media_utc": "1970-01-01T00:00:00Z",
    "duplicate_flag": false,
    "cluster_assignment": "Public Support"
  },
  {
    "profile_pic_url": "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/246943276_1222108708309463_2016336097588774836_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2gFl55E7M6HgQpw0-fdwPoTOVkrMuQgnxJ2KdMGfP2sTX9lVkfPx4vaygdNrL-kymUU&_nc_ohc=-0eE2LkWTFcQ7kNvwEDSJ5u&_nc_gid=D-agiJZY2hIGCSsSev9kCA&edm=AHUBisUBAAAA&ccb=7-5&ig_cache_key=GCwOuA7XiW9bgFcEALSHk2z-dvsbbkULAAAB1501500j-ccb7-5&oh=00_Af3s2MBUMz3BFu0dE_hMqduzNzlM3HESpDDIzd5r_XgNVw&oe=69EFCDB2&_nc_sid=bc52df",
    "full_name": "Cajetinac Pavle",
    "username": "_pav1e",
    "is_private": true,
    "is_verified": false,
    "is_new": true,
    "latest_reel_media_utc": "1970-01-01T00:00:00Z",
    "duplicate_flag": false,
    "cluster_assignment": "General Audience"
  },
  {
    "profile_pic_url": "https://scontent-iad6-1.cdninstagram.com/v/t51.2885-19/573323465_1219825463302212_7278921664109726296_n.png?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xNTAuYzIifQ&_nc_ht=scontent-iad6-1.cdninstagram.com&_nc_cat=1&_nc_oc=Q6cZ2gHYoszq1OWujB1fipDqJbN0sqpjc5GbzY2_bI5qeQS_SrwCFD3_3LD4jEz5LAOAmBY&_nc_ohc=h-Em0EtRUm8Q7kNvwGM4BZK&_nc_gid=j798rJBhefiesH7lgYZw0Q&edm=ALlQn9MBAAAA&ccb=7-5&ig_cache_key=YW5vbnltb3VzX3Byb2ZpbGVfcGlj.3-ccb7-5&oh=00_Af0kcQhWLYqoAvuRdI1y5ShcUNveHPUdF0CXr6yiXdvTDA&oe=69EFC4AA&_nc_sid=e7f676",
    "full_name": "Dragica Tadić",
    "username": "dragica_tadic123zunjic",
    "is_private": false,
    "is_verified": false,
    "is_new": true,
    "latest_reel_media_utc": "1970-01-01T00:00:00Z",
    "duplicate_flag": true,
    "cluster_assignment": "Public Support"
  },
  {
    "profile_pic_url": "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/104851916_261999718560236_7523859797524015288_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=108&_nc_oc=Q6cZ2gFl55E7M6HgQpw0-fdwPoTOVkrMuQgnxJ2KdMGfP2sTX9lVkfPx4vaygdNrL-kymUU&_nc_ohc=ohLbkhaWtAgQ7kNvwH0bge&_nc_gid=D-agiJZY2hIGCSsSev9kCA&edm=AHUBisUBAAAA&ccb=7-5&ig_cache_key=GMzpPwbs8SeQSe4AALjoQmufHmpobkULAAAB1501500j-ccb7-5&oh=00_Af1ZDB-WYq_KkNW4AfxQZIUoscBCx-bbsPJ-mExkiNRraA&oe=69EFB206&_nc_sid=bc52df",
    "full_name": "Prof. dr Zorana Z. Mihajlović",
    "username": "zorana_zm",
    "is_private": false,
    "is_verified": false,
    "is_new": false,
    "latest_reel_media_utc": "2026-04-23T05:25:35Z",
    "follower_count": 12500,
    "duplicate_flag": false,
    "cluster_assignment": "Leadership Discussion"
  },
  {
    "profile_pic_url": "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/474153860_622457450720456_5624607084228391313_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby44NTQuYzIifQ&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=108&_nc_oc=Q6cZ2gFl55E7M6HgQpw0-fdwPoTOVkrMuQgnxJ2KdMGfP2sTX9lVkfPx4vaygdNrL-kymUU&_nc_ohc=ZjXd5tL2BwYQ7kNvwHv09iL&_nc_gid=D-agiJZY2hIGCSsSev9kCA&edm=AHUBisUBAAAA&ccb=7-5&ig_cache_key=GIQDQxzI7DwrHzYCAJExlLhXng5ObkULAAAB1501500j-ccb7-5&oh=00_Af1cDaN2rWoYcgVy1MkNgI6vXDsG9Obp-oJUKEh2QZeMqw&oe=69EFCD1B&_nc_sid=bc52df",
    "full_name": "MIHAJLO JAKŠIĆ",
    "username": "mihajlojaksic",
    "is_private": true,
    "is_verified": false,
    "is_new": false,
    "latest_reel_media_utc": "1970-01-01T00:00:00Z",
    "follower_count": 3400,
    "duplicate_flag": false,
    "cluster_assignment": "Core Proponents"
  },
  {
    "profile_pic_url": "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/30926891_225155391572955_4556965820088975360_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby42ODQuYzIifQ&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2gFl55E7M6HgQpw0-fdwPoTOVkrMuQgnxJ2KdMGfP2sTX9lVkfPx4vaygdNrL-kymUU&_nc_ohc=cm-KTudT9KMQ7kNvwEYETrw&_nc_gid=D-agiJZY2hIGCSsSev9kCA&edm=AHUBisUBAAAA&ccb=7-5&ig_cache_key=GCvo1wHbSyITx8wAAAAAAABFmD0-bkULAAAB1501500j-ccb7-5&oh=00_Af1qD8JyoYNKN958-ownuZOSW7E3Cr1TtbKrQXC8hu1JHA&oe=69EFA6BC&_nc_sid=bc52df",
    "full_name": "Aleksandar Jaksic",
    "username": "jaksic_official",
    "is_private": false,
    "is_verified": false,
    "is_new": false,
    "latest_reel_media_utc": "1970-01-01T00:00:00Z",
    "follower_count": 85000,
    "duplicate_flag": false,
    "cluster_assignment": "Primary Entity"
  }
];

export const JAKSIC_COMMENTS: ImportedCommentRow[] = [
  {
    "id": "18063186944207277",
    "text": "Kada odrobijate šta imate i kada vam oduzmemo državljansto taman ćemo vas tamo deportovati.",
    "timestamp": "2025-12-03T14:58:34.000Z",
    "ownerUsername": "ekostraza",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.2885-19/129772770_980641092462416_2188451053464989221_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=106&ig_cache_key=GOIsvAdQ5-dL43sDACUuHGKj8F4ebkULAAAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=8XUdnmNQHYAQ7kNvwG09OIc&_nc_oc=AdpoHvG7tbYUnKhmr448RTWcS-bykzdZj9OJ1HZYJpoml69OMJMLdHiJxAhJwcBXCok&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_ss=703ba&oh=00_Af1ZaCc9vpKO2vz5UZYXqWb3WA3_cuYQlBPCGZt2OgSAnw&oe=69EFC598",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  },
  {
    "id": "18000276521835272",
    "text": "Dobrog lidera i državnika svi poznaju 🇷🇸🇷🇸🇷🇸",
    "timestamp": "2025-11-30T22:09:09.000Z",
    "ownerUsername": "ivanselisnik",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.82787-19/603167920_18377152315156819_8363516868479241888_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=108&ig_cache_key=GLCc8yNTaboz7ElBAKBOsbJHLhF0bmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy43MTMuQzMifQ%3D%3D&_nc_ohc=UdzAKQ65oK4Q7kNvwHaMA45&_nc_oc=Adq-GjNdKJQgBsEi1t-oIVrfmRvFz3aoHMDhE5DYELIN4GQwf5P5K59zrwEaFFdFr0A&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_gid=O80dgpwPOXfzJ4dYi_1tqw&_nc_ss=703ba&oh=00_Af3vnheG24boglZ8qp-XNNiHZT3SotbLunGEsx7jNQrnuA&oe=69EFA4CD",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  },
  {
    "id": "18288911080302310",
    "text": "Ма сигурно знају за њега, дај не ложи овај народ, поготово ови млади немају појма.",
    "timestamp": "2025-11-29T23:52:07.000Z",
    "ownerUsername": "nbgd_iz_principa",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.82787-19/642409278_18388986259156457_1145094001237831678_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=110&ig_cache_key=GD5jSibprcGBr1RBAP4vNlrtMOQPbmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=t-HCrA6usc8Q7kNvwEUmqAm&_nc_oc=AdqN_mdO2d3-WZYmeJ5RNQSVGCQu0nPjgGk-6bwJ1OaUTg-kBWXQzpiaVXU2bQnT3Q0&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_gid=O80dgpwPOXfzJ4dYi_1tqw&_nc_ss=703ba&oh=00_Af3N3hE0FmtmAc3pJJZax_tH7JBvuUwStAPzLFtnm-B-PQ&oe=69EFB56B",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  },
  {
    "id": "18106174576578373",
    "text": "Više je poštovan u Kini nego u svojoj zemlji.",
    "timestamp": "2025-12-14T13:57:39.000Z",
    "ownerUsername": "verica426",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.2885-19/54247501_316450069063466_3261180096760774656_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=105&ig_cache_key=GE3AOwMqp-RFzx8BAAAAAAAFCkItbkULAAAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy45NjAuQzMifQ%3D%3D&_nc_ohc=0EMJOWbuMZcQ7kNvwHMvoXN&_nc_oc=AdqLsaFg3ZUzsuGXZmcw1t-utG7tj3EjtBPlRe6tynMvhwRYTi3_DSHh6PTizQniM_k&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_ss=703ba&oh=00_Af1OAW38zMwF7-tA36ThExTZhvgozMJa0Kti2SgsB4sPBQ&oe=69EFB5A9",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  },
  {
    "id": "18332744434214075",
    "text": "Žalosno je da je cenjeniji u svetu nego u Srbiji",
    "timestamp": "2026-01-03T11:19:14.000Z",
    "ownerUsername": "strujagagi",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.2885-19/340297251_9175940342477182_1973253187503905005_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=103&ig_cache_key=GCOGSBR_8ZcYeJkgAO3YE71RZ2IbbkULAAAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=T4-uv0wd40MQ7kNvwFVJSf3&_nc_oc=Ado1Fj7FLKpUnpeM3GU_HejwDeABdB_7na2zz0M-9BXymQZ7r6lQ-298PN9D05_sfXQ&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_ss=703ba&oh=00_Af0r8NnInSzf3tEF1grvnSzx4kgsCjN1Ilb9SiITdffNhA&oe=69EFB2BF",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  },
  {
    "id": "18043968641686288",
    "text": "Po cemu je bratska??? Osim po duznickom ropstvu Srbije i davanju prirodnih bogatstava????",
    "timestamp": "2025-11-29T21:31:15.000Z",
    "ownerUsername": "bajcaa._",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.82787-19/627498706_18125194930553219_1491497997637032270_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=105&ig_cache_key=GNLeZiWDAVLNxGRAAE6ZXMyG3bIUbmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=dbeqK8bEvZ8Q7kNvwGREO-f&_nc_oc=AdrxS16XpKQ3OXoDTdyFMo0keS4H92fd7KNzh-KT3XpFVOee6bpWRcaEKRPcFxbyF9g&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_gid=O80dgpwPOXfzJ4dYi_1tqw&_nc_ss=703ba&oh=00_Af2TyPflUMzXtDLLoOzTRpqiMkPOKj-qDQCxaeea0I2qxA&oe=69EF9B51",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  },
  {
    "id": "17990103119884083",
    "text": "Klasičan naprednjak, slaže kako zine 😂",
    "timestamp": "2025-11-30T09:26:24.000Z",
    "ownerUsername": "jovana.joe7",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.2885-19/452045639_7868145699942204_6673600090393531304_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=104&ig_cache_key=GEer8Ro8b3xtCfQbAKjT64jsY51cbkULAAAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy41ODMuQzMifQ%3D%3D&_nc_ohc=nnQL-WcxeLcQ7kNvwESyUl8&_nc_oc=AdpcBBWzSYKbwwWgoytuPNcCBL6OxTXV_rhqaLnbZqmekYQVza2Wds38327COxRCaBY&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_ss=703ba&oh=00_Af3eojhh88qfu4iVLpoz_iXp1QVmSErPapB4G7YFQxcvkQ&oe=69EFA1E6",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  },
  {
    "id": "18083792137841303",
    "text": "Jebo vam Vučić mamu svima i vi njemu isto..mrš",
    "timestamp": "2025-11-29T19:48:01.000Z",
    "ownerUsername": "jarvisfromksj",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.82787-19/567548508_18537936250026628_4251093584025090436_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=102&ig_cache_key=GFwa1CGEOg2hJ9xBAIT5wWYX6-46bmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=Oy5ImrWHo_4Q7kNvwFXl9vM&_nc_oc=AdqPUzt6008tdC_b7-_8YnPR5je_52Dl92IiiFfrORPBxn1H3YOfBhHsMa5WyneMR5U&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_gid=O80dgpwPOXfzJ4dYi_1tqw&_nc_ss=703ba&oh=00_Af0IvqKcSJr2oRQYWrijGsrxCj4fAIGLxLpzwrqjttILHA&oe=69EFB074",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  },
  {
    "id": "18053948942320748",
    "text": "🤑🤑🤑🤑 samo pare!",
    "timestamp": "2025-03-20T12:14:19.000Z",
    "ownerUsername": "snezanamisicbogunovic",
    "ownerProfilePicUrl": "https://scontent-lax7-1.cdninstagram.com/v/t51.82787-19/545353507_18523537915062504_3859856432319513012_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=111&ig_cache_key=GCNvgSDoKGlBD89BALRBaYz59pA1bmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=ISz8gGoqGMgQ7kNvwEFqRzC&_nc_oc=AdqdS6Hczh5i8w2IptXzaaZsBXfYn45Pxecv_D3HVDpdqvfiaQ8R__Cj5xcYcL-B8ak&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-lax7-1.cdninstagram.com&_nc_gid=NmCzdO2p7lgVr0HuSIvyHg&_nc_ss=703ba&oh=00_Af0qljNtZqiJ-xK0nHN3y8UZx8NnrhLtkfPcUNnsIOhghg&oe=69EFB35E",
    "postUrl": "https://www.instagram.com/p/DHELu5KIUlc/"
  },
  {
    "id": "17945533053165007",
    "text": "I moj i NAJLEPSI..Love you❤️😍",
    "timestamp": "2026-04-17T02:19:08.000Z",
    "ownerUsername": "mayya.kup",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.82787-19/642512650_18535649146069549_6553581885773978165_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=106&ig_cache_key=GAr3SyYtYggfE9pBADUa-rMAAPNabmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=H06oQJQRGZwQ7kNvwHftmLq&_nc_oc=AdrC7_HFTOBN6UEDTTUGHBU-kK9SF8f2peHvwZ3eAmFOcpUrwpTIfIuhyoLfV6aRlNQ&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_gid=7WZROdKPqnWkf0dUCOWMnA&_nc_ss=703ba&oh=00_Af1fiuQc42jjEcUCVkJSkNMMk3VShaNiqLZrkzWD_e-AwA&oe=69EFBCF3",
    "postUrl": "https://www.instagram.com/p/DHMA3r-omu9/"
  },
  {
    "id": "18292558078253621",
    "text": "👏👏❤️",
    "timestamp": "2025-08-25T15:48:20.000Z",
    "ownerUsername": "_ruzica_j_d",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.89012-19/573323465_1219825463302212_7278921664109726296_n.png?stp=dst-webp_s150x150&_nc_cat=1&ig_cache_key=YW5vbnltb3VzX3Byb2ZpbGVfcGlj.3-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy5DMyJ9&_nc_ohc=r95bEs_vwCoQ7kNvwFrIY8m&_nc_oc=AdrlNfNEo3C0PBxzuR7WhIWEDUfD6f2GNMQkS8ZloE45DepZNIJG0bjiwepVeKf4h3o&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_gid=7WZROdKPqnWkf0dUCOWMnA&_nc_ss=703ba&oh=00_Af1u0qVKc3pVY8z2uXY0Gr3ZRihVopSDzwfoyBSfDyR9pw&oe=69EFA1D9",
    "postUrl": "https://www.instagram.com/p/DHMA3r-omu9/"
  },
  {
    "id": "18163921717351752",
    "text": "YIZDAJICO PRESTANI DA LAZES, SRBACI NISU OVCE!  SAKALU  OCEKUJES PLEN OD NAPACENOG NARODA. PFOKLETBIO!",
    "timestamp": "2025-05-15T10:35:03.000Z",
    "ownerUsername": "svetlanapoljsak",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.89012-19/573323465_1219825463302212_7278921664109726296_n.png?stp=dst-webp_s150x150&_nc_cat=1&ig_cache_key=YW5vbnltb3VzX3Byb2ZpbGVfcGlj.3-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy5DMyJ9&_nc_ohc=r95bEs_vwCoQ7kNvwFrIY8m&_nc_oc=AdrlNfNEo3C0PBxzuR7WhIWEDUfD6f2GNMQkS8ZloE45DepZNIJG0bjiwepVeKf4h3o&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_gid=7WZROdKPqnWkf0dUCOWMnA&_nc_ss=703ba&oh=00_Af1u0qVKc3pVY8z2uXY0Gr3ZRihVopSDzwfoyBSfDyR9pw&oe=69EFA1D9",
    "postUrl": "https://www.instagram.com/p/DHMA3r-omu9/"
  },
  {
    "id": "18294226546172545",
    "text": "Mrs bre u picku materinu jebem li ti sve.",
    "timestamp": "2025-03-21T07:05:15.000Z",
    "ownerUsername": "__nele._",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.82787-19/670887012_17926280973291973_2552901425963890314_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=111&ig_cache_key=GGTs-CfFkY6J268-AIp2KjFSum0jbmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=5KPOgNsPzrMQ7kNvwFtbQdi&_nc_oc=AdrQN5j1CA60X2cfGkFnzt75o_DsBS6yYjiBv7c19n88IKehG_BYDcwfUavN3okQNz4&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_gid=7WZROdKPqnWkf0dUCOWMnA&_nc_ss=703ba&oh=00_Af0n_Zq2XOoCEY2pb_ce-aVjyJE1aEzB8QJ--FS0ndX3gQ&oe=69EFC25E",
    "postUrl": "https://www.instagram.com/p/DHMA3r-omu9/"
  },
  {
    "id": "18055786954897559",
    "text": "Oli promenit’ sako drug jednom, usmrdje ti se taj",
    "timestamp": "2025-03-20T21:08:10.000Z",
    "ownerUsername": "stanislav_puhalo",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.82787-19/672383868_18319121479283058_4578181842506310120_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=103&ig_cache_key=GHzDEyhysV7YJBVBAOhhuych_Ig-bmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDY3LkMzIn0%3D&_nc_ohc=n5e_hmGiyKMQ7kNvwGh8sEV&_nc_oc=AdqwpJEZPQRRPEF7rLAjmGCLE11A7tR5n6SUp22ReRN4KNXj1NqWfPnL42zrIrBlZNI&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_gid=7WZROdKPqnWkf0dUCOWMnA&_nc_ss=703ba&oh=00_Af0WY-xfOo0XnmI2o4PLxDQyxUI_JDHJcTvla9uUB9FwqA&oe=69EFB281",
    "postUrl": "https://www.instagram.com/p/DHMA3r-omu9/"
  },
  {
    "id": "18082343179568019",
    "text": "Bravo bravo bravo👏",
    "timestamp": "2025-03-20T13:51:58.000Z",
    "ownerUsername": "stojanovic__lj_69",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.2885-19/474141764_1320470512311472_2045432957354274745_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=108&ig_cache_key=GETUQhywnNL-9bAEALlv_gJw1mIcbkULAAAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=FBKB375RGdoQ7kNvwExQpgk&_nc_oc=AdoTN8AD3icbCQCKD8VcE-ECLGgGsVO-AUDMpDcg_JY0G-RSAZejGaUZAudpgMQG3nY&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_ss=703ba&oh=00_Af0UYr2v4cnjWKnXG12rnITvGbG_5qAjTPHPa3s9xBdbUA&oe=69EF9923",
    "postUrl": "https://www.instagram.com/p/DHMA3r-omu9/"
  },
  {
    "id": "17856130587400354",
    "text": "Ološu, ne laži više! Stiže vas kazna Jova Bakića!",
    "timestamp": "2025-03-20T12:13:40.000Z",
    "ownerUsername": "snezanamisicbogunovic",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.82787-19/545353507_18523537915062504_3859856432319513012_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=111&ig_cache_key=GCNvgSDoKGlBD89BALRBaYz59pA1bmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=ISz8gGoqGMgQ7kNvwEbvxKW&_nc_oc=AdomXCkjN7HSAlYMGIU4t0gH9fPrmSIrbTaQEEKqmUtkNFrLFPVoKF8uXdvq9MOBuOM&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_gid=7WZROdKPqnWkf0dUCOWMnA&_nc_ss=703ba&oh=00_Af3IBu7dlGEhRpRtoXeaexlzZ1bOtuz2TCFYy4lpV7gtHg&oe=69EFB35E",
    "postUrl": "https://www.instagram.com/p/DHMA3r-omu9/"
  },
  {
    "id": "18034006202292308",
    "text": "👏👏",
    "timestamp": "2025-03-19T14:42:30.000Z",
    "ownerUsername": "veselinovic_slavica",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.2885-19/484969662_3398921366911133_8019095467399545069_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=106&ig_cache_key=GL4M6ByduLEMTRMMAO2ASzLXjElvbkULAAAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=gW5Xqc4NLssQ7kNvwGvpA-q&_nc_oc=Adp2avImKI4Tl9-UZ5EdNdFcXn4i9U7eGo18pVQtwpVJar3XAujEFGGl3OU4V-SPjBk&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_ss=703ba&oh=00_Af0EvFgGZ3XLi5fDQdFu9papxeTtSnjND179UD2p0rsHRg&oe=69EFBAEF",
    "postUrl": "https://www.instagram.com/p/DHMA3r-omu9/"
  },
  {
    "id": "17940661163966085",
    "text": "SVI koji ste protiv Vucica POPUSITE lulu MIRA I VUCKU I MENI …!!!\nPRIJATNO 😊",
    "timestamp": "2025-11-30T02:32:10.000Z",
    "ownerUsername": "lazarevic3299",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.89012-19/573323465_1219825463302212_7278921664109726296_n.png?stp=dst-webp_s150x150&_nc_cat=1&ig_cache_key=YW5vbnltb3VzX3Byb2ZpbGVfcGlj.3-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy5DMyJ9&_nc_ohc=r95bEs_vwCoQ7kNvwFuraQA&_nc_oc=AdrEbod_O7nlk99XU4fIzm0VM6eqBtV3JQXtIIbwQazH73Qp3Wxvjjx6KDShc2C287U&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_gid=O80dgpwPOXfzJ4dYi_1tqw&_nc_ss=703ba&oh=00_Af0-hbo9cOIVTSdChhVFHEBzQ3MpulxzigocyiNbEua0BQ&oe=69EFA1D9",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  },
  {
    "id": "18011176193647714",
    "text": "@bajcaa._ Niko ne pomaže džaba! Čast izuzecima.",
    "timestamp": "2025-11-30T04:52:00.000Z",
    "ownerUsername": "mladipcelar7",
    "ownerProfilePicUrl": "https://scontent-dfw5-2.cdninstagram.com/v/t51.2885-19/271500920_257360593169643_2339350503919556357_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=104&ig_cache_key=GHjGLhDrLLxuEeoAAAWXQY-jCncgbkULAAAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=wJG6EUeH7u0Q7kNvwERBOaL&_nc_oc=Adp3Q_gKQMr4gQO28Z3V5fXthX8s8m3Bx5VMoNXFt92m6LBXCmSM9_GyWvuGJfVZQno&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-dfw5-2.cdninstagram.com&_nc_ss=703ba&oh=00_Af1IVvaaq663vD-Gt4aRovrvvb_5KIlDZJE6KgNV0A87RQ&oe=69EFB2A0",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  },
  {
    "id": "18074993128997998",
    "text": "@bajcaa._ непризнају Косово а  ми Тајван",
    "timestamp": "2025-11-30T06:36:44.000Z",
    "ownerUsername": "_nikola_111111",
    "ownerProfilePicUrl": "https://scontent-dfw6-1.cdninstagram.com/v/t51.75761-19/500061810_18350760118153185_7741848484066190328_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=103&ig_cache_key=GHJWzh3hbzNK6zFBAPhjqZ0tknBrbvEnAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4zODYuQzMifQ%3D%3D&_nc_ohc=gfGP46prftUQ7kNvwEA-JYG&_nc_oc=AdoF_seelvB2DPHG1WQRraqWB53ct6-HCq6xoM0aRFX95brOm5h6uLnEjvWrVI2hE0g&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-dfw6-1.cdninstagram.com&_nc_gid=L89XRpwwUMRAar89QClR_A&_nc_ss=703ba&oh=00_Af3wUgq5odAmT6e23nZz34jUDoaada9Bc5jO6OTbce1rEg&oe=69EFC092",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  },
  {
    "id": "17872934598386219",
    "text": "@mladipcelar7 aha i?sta je pisac hteo da kaze? Da sam u pravu?",
    "timestamp": "2025-11-30T07:20:37.000Z",
    "ownerUsername": "bajcaa._",
    "ownerProfilePicUrl": "https://scontent-dfw5-1.cdninstagram.com/v/t51.82787-19/627498706_18125194930553219_1491497997637032270_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=105&ig_cache_key=GNLeZiWDAVLNxGRAAE6ZXMyG3bIUbmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=dbeqK8bEvZ8Q7kNvwHr-UYE&_nc_oc=AdpOH-cu2yevYD70yrYTTBnASqFuLKLM8r_-zxqN5Vbf-quW_hZYosE3_CVcoVwTgSQ&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-dfw5-1.cdninstagram.com&_nc_gid=L89XRpwwUMRAar89QClR_A&_nc_ss=703ba&oh=00_Af0XRcolXPCXVsvXtXB-4Dw11W53x9S31WZ3SvrDTO424g&oe=69EF9B51",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  },
  {
    "id": "18079377916898400",
    "text": "@_nikola_111111 i po tome smo ....braca??? Trinidan i Tobago ne priznaju Kosovo...znaci to su nam braca???? Koja braca kozo, gledaju samo kako da nas navuku da im dugujemo sto vise i vise...ovco zar mislis da negde postoji bilo sta osim interesa???? Zar stvarno mislis da Kineza boli patkica za Srbiju i da uopste znaju ko smo mi??",
    "timestamp": "2025-11-30T10:47:42.000Z",
    "ownerUsername": "bajcaa._",
    "ownerProfilePicUrl": "https://scontent-dfw5-1.cdninstagram.com/v/t51.82787-19/627498706_18125194930553219_1491497997637032270_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=105&ig_cache_key=GNLeZiWDAVLNxGRAAE6ZXMyG3bIUbmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=dbeqK8bEvZ8Q7kNvwHr-UYE&_nc_oc=AdpOH-cu2yevYD70yrYTTBnASqFuLKLM8r_-zxqN5Vbf-quW_hZYosE3_CVcoVwTgSQ&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-dfw5-1.cdninstagram.com&_nc_gid=L89XRpwwUMRAar89QClR_A&_nc_ss=703ba&oh=00_Af0XRcolXPCXVsvXtXB-4Dw11W53x9S31WZ3SvrDTO424g&oe=69EF9B51",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  },
  {
    "id": "18433915645105252",
    "text": "Ljudi, ovo je sve namešteno i unapred isplanirano, vidi se lepo po njihovoj reakciji, ne primajte se. Ovo je sve loša gluma!!!",
    "timestamp": "2026-01-07T06:11:43.000Z",
    "ownerUsername": "vragolanka888",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.2885-19/354338637_1417075512460693_8638714965587556170_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=109&ig_cache_key=GE3HHhWVRYqa0ggFAEp3ssd94eJ3bkULAAAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy45MzkuQzMifQ%3D%3D&_nc_ohc=YirbKQHVmkUQ7kNvwHcmtPs&_nc_oc=AdoBq76G3xJW1YUuMWKNtqtt2I2XKJUezgr8vp7XnNlyMY3WP6GctANSk7D0sumzBv4&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_ss=703ba&oh=00_Af13Ub5R3vR4fm1QK_H42kS77oE4tePtnr8wY2QWHm-QOA&oe=69EF9A7B",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  },
  {
    "id": "18084247328102954",
    "text": "Bratski i ostani tamo... Jebala Vas Kina",
    "timestamp": "2025-11-30T10:40:21.000Z",
    "ownerUsername": "nemanjazzlatarev",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.82787-19/649868266_18572241361044991_6110358928243456942_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=111&ig_cache_key=GOozvCb-BQLpWvtBAK57FjgSW8xUbmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=WiI3goXx2QgQ7kNvwFr-JRH&_nc_oc=AdrfilwT5GmJUPgvkIk8bJmdb-yM31kUY9GL-AkXQyZDGHxxKzY0UZv95gm4RX2ZTds&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-dfw5-1.cdninstagram.com&_nc_gid=O80dgpwPOXfzJ4dYi_1tqw&_nc_ss=703ba&oh=00_Af2XGG_l7UyleJUIc_-olX-0PcY7U1LCrD5GRFyjB0gh2g&oe=69EFCCC5",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  },
  {
    "id": "18059022362277265",
    "text": "Kamo srece da nikad nisu dosli  kod nas,od zemlje nam napravise trovacnicu,a ti setaj gradom i pevaj ,,sliku tvoju ljubim...\"😡😡",
    "timestamp": "2025-11-30T06:36:37.000Z",
    "ownerUsername": "sneza_milivojevic123",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.89012-19/573323465_1219825463302212_7278921664109726296_n.png?stp=dst-webp_s150x150&_nc_cat=1&ig_cache_key=YW5vbnltb3VzX3Byb2ZpbGVfcGlj.3-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy5DMyJ9&_nc_ohc=r95bEs_vwCoQ7kNvwFuraQA&_nc_oc=AdrEbod_O7nlk99XU4fIzm0VM6eqBtV3JQXtIIbwQazH73Qp3Wxvjjx6KDShc2C287U&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_gid=Qz4dpKWwfJ5UyeGGjIUWsg&_nc_ss=703ba&oh=00_Af3XJD957eVMq9gOw39Xw5bmN7QN1DNaq5ibHql4VPpwqQ&oe=69EFA1D9",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  },
  {
    "id": "17943198900084694",
    "text": "Mrs konjino raspala.",
    "timestamp": "2025-11-30T04:05:00.000Z",
    "ownerUsername": "strazar_noci",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.82787-19/669851491_18587566834020555_2684014611592070285_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=100&ig_cache_key=GGMf7SfLcGEmSwlCAI1E55cRiT8lbmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=Xx29ZWtph74Q7kNvwFOEOnM&_nc_oc=Adry5tMmCzhp66VJJ5gEklDMl7ht7PLni7oM0ewRIBO0DzdQ7Wnh8AZ8EdXo1BRxLGw&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_gid=Qz4dpKWwfJ5UyeGGjIUWsg&_nc_ss=703ba&oh=00_Af2LQy1EFUEVK9xky1E9w70FTz6Y3Ka4fBvIQXwEqtYzRA&oe=69EFB604",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  },
  {
    "id": "18091827658993421",
    "text": "👏👏👏❤️❤️❤️",
    "timestamp": "2026-01-06T17:07:42.000Z",
    "ownerUsername": "spomenka.milicevic55",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.89012-19/573323465_1219825463302212_7278921664109726296_n.png?stp=dst-webp_s150x150&_nc_cat=1&ig_cache_key=YW5vbnltb3VzX3Byb2ZpbGVfcGlj.3-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy5DMyJ9&_nc_ohc=r95bEs_vwCoQ7kNvwFuraQA&_nc_oc=AdrEbod_O7nlk99XU4fIzm0VM6eqBtV3JQXtIIbwQazH73Qp3Wxvjjx6KDShc2C287U&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_gid=PTIaE_i-YIrJtHqBB2tJZA&_nc_ss=703ba&oh=00_Af1PMWX4CTlH9L7CnGC7sFWP4tvLnt5ElQ-xD5YbOl5fcg&oe=69EFA1D9",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  },
  {
    "id": "18198191167332851",
    "text": "ALEKSANDAR VUCIC MY IMPERATOR I LOVE YOU 💪",
    "timestamp": "2026-01-05T01:58:45.000Z",
    "ownerUsername": "d.kkuz",
    "ownerProfilePicUrl": "https://scontent-vie1-1.cdninstagram.com/v/t51.82787-19/528705512_17886309876337446_8588332253974391666_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=110&ig_cache_key=GOhngx8mi4UKgYs-AHJrLJuu4i93bmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=wRxVwbu_oFsQ7kNvwG77lM-&_nc_oc=AdrOjZiQLfmqaONY4Zuc5qIEbxncQC0XUQxgEkJYjPOnzycpVk0N0vC_WnsL4KLS-pg&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_gid=PTIaE_i-YIrJtHqBB2tJZA&_nc_ss=703ba&oh=00_Af0ZntmQra4SYIGasS9aW6gf8V6HC6gFLwexI12Fc65JCg&oe=69EFB6DC",
    "postUrl": "https://www.instagram.com/p/DRpmfFqiHeE/"
  }
];

export const JAKSIC_NARRATIVES: ExtractedNarrative[] = [
  {
    id: 'nar-j-1',
    label: 'Public Support',
    description: 'Expressions of loyalty and positive perception of leadership.',
    sourcePostId: 'DRpmfFqiHeE',
    sentiment: 'positive',
    keywords: ['lider', 'državnik', 'podrška', 'imperator'],
    pressureType: 'Positive Reinforcement',
    confidence: 0.94,
    supportingComments: [
      'Dobrog lidera i državnika svi poznaju 🇷🇸🇷🇸🇷🇸',
      'ALEKSANDAR VUCIC MY IMPERATOR I LOVE YOU 💪',
      'I moj i NAJLEPSI..Love you❤️😍'
    ],
    commentCount: 45,
    reachEstimate: 180000
  },
  {
    id: 'nar-j-2',
    label: 'Economic Criticism',
    description: 'Concerns regarding economic independence, resource management, and foreign influence.',
    sourcePostId: 'DRpmfFqiHeE',
    sentiment: 'negative',
    keywords: ['ropstvo', 'dug', 'prirodna bogatstva', 'kina'],
    pressureType: 'Constructive Criticism',
    confidence: 0.89,
    supportingComments: [
      'Po cemu je bratska??? Osim po duznickom ropstvu Srbije...',
      '🤑🤑🤑🤑 samo pare!',
      'Kamo srece da nikad nisu dosli kod nas, od zemlje nam napravise trovacnicu...'
    ],
    commentCount: 32,
    reachEstimate: 95000
  },
  {
    id: 'nar-j-3',
    label: 'Hostile Escalation',
    description: 'Highly aggressive comments requiring potential moderation or defensive briefing.',
    sourcePostId: 'DRpmfFqiHeE',
    sentiment: 'negative',
    keywords: ['jebo', 'mrs', 'mrš', 'konjino'],
    pressureType: 'Hostile Alignment',
    confidence: 0.98,
    supportingComments: [
      'Jebo vam Vučić mamu svima...',
      'Mrs konjino raspala.',
      'Bratski i ostani tamo... Jebala Vas Kina'
    ],
    commentCount: 28,
    reachEstimate: 60000
  }
];

export const JAKSIC_CONVERSATIONS: ConversationThread[] = [
  {
    id: 'thread-j-1',
    clientId: '1',
    platform: 'instagram',
    author: 'bajcaa._',
    content: 'Po cemu je bratska??? Osim po duznickom ropstvu Srbije i davanju prirodnih bogatstava????',
    timestamp: '2025-11-29T21:31:15Z',
    sentiment: 'negative',
    status: 'unresolved',
    escalationFlag: true,
    replies: [
      { author: 'mladipcelar7', content: '@bajcaa._ Niko ne pomaže džaba! Čast izuzecima.', timestamp: '2025-11-30T04:52:00Z' },
      { author: '_nikola_111111', content: '@bajcaa._ непризнају Косово а ми Тајван', timestamp: '2025-11-30T06:36:44Z' },
      { author: 'bajcaa._', content: '@mladipcelar7 aha i?sta je pisac hteo da kaze? Da sam u pravu?', timestamp: '2025-11-30T07:20:37.000Z' }
    ]
  }
];

export const JAKSIC_DEMO_SAFE_RESPONSES = [
  "Komentar evidentiran u demo prikazu.",
  "Poruka je registrovana u pregledu reakcija.",
  "Ova reakcija je povezana sa objavom u simulaciji.",
  "Komentar je dodat u tok diskusije za testiranje interfejsa.",
  "Reakcija je zabeležena u narativnom pregledu.",
  "Ova poruka je uključena u demo analizu sentimenta.",
  "Komentar je obrađen u testnom toku odobravanja.",
  "Reakcija je prikazana u simuliranom feed-u komentara.",
  "Poruka je povezana sa objavom radi demo prikaza.",
  "Komentar je dodat u pregled diskusionih tokova.",
  "Ova reakcija je evidentirana za test prikaza.",
  "Komentar je uspešno ubačen u simulaciju objave."
];
