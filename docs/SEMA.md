## Adatbázis séma

Az adatbázis sémáját a [dbdiagram.io](https://dbdiagram.io/) nevű eszközzel terveztem meg.

Van egy-két olyan döntés, ami jelen helyzetben helyesnek tűnt.
Tisztában vagyok vele, hogy ezek az alkalmazás fejlesztése közben kisebb-nagyobb változtatásokon eshetnek át.
Ezekről a kommentekben és note-okban lehet bővebben olvasni.

Az eszköz által [generált vizualizáció](./db_sema.pdf) is megtalálható a repositoryban.

``` text
// ==========================================
// AUTH & IDENTITÁS (ASP.NET Core Identity)
// ==========================================

Table asp_net_users {
  id nvarchar(450) [pk, note: 'Identity User ID (GUID string)']
  user_name nvarchar(256) [not null]
  email nvarchar(256) [not null]
  created_at datetime2 [not null, default: `sysdatetime()`]
}

// Fejlesztőpedagógus profil (Tenant gyökér)
Table fejlesztopedagogusok {
  id int [pk, increment]
  identity_user_id nvarchar(450) [not null, unique]
  nev nvarchar(150) [not null]
  aktiv_tanev_id int [null]
}

Ref: asp_net_users.id - fejlesztopedagogusok.identity_user_id

// ==========================================
// TÖRZSTÁBLÁK ÉS STRUKTÚRÁK
// ==========================================

Table tanevek {
  id int [pk, increment]
  fejleszto_id int [not null]
  kezdo_ev smallint [not null, note: 'pl. 2025 (a 2025/2026-os tanévhez)']
  nev nvarchar(20) [not null, note: 'Megjelenített címke, pl. 2025/2026']

  indexes {
    fejleszto_id [name: 'idx_tanevek_fejleszto']
    (fejleszto_id, kezdo_ev) [unique, name: 'uq_tanev_kezdoev_per_fejleszto']
  }
}

Ref: fejlesztopedagogusok.id < tanevek.fejleszto_id
Ref: tanevek.id - fejlesztopedagogusok.aktiv_tanev_id

Table iskolak {
  id int [pk, increment]
  fejleszto_id int [not null]
  nev nvarchar(200) [not null]

  indexes {
    fejleszto_id [name: 'idx_iskolak_fejleszto']
  }
}

Ref: fejlesztopedagogusok.id < iskolak.fejleszto_id

Table szakvelemeny_kiallitok {
  id int [pk, increment]
  fejleszto_id int [not null]
  nev nvarchar(200) [not null]

  indexes {
    fejleszto_id [name: 'idx_szakvelemeny_kiallitok_fejleszto']
  }
}

Ref: fejlesztopedagogusok.id < szakvelemeny_kiallitok.fejleszto_id

Table fejlesztesi_teruletek {
  id int [pk, increment]
  fejleszto_id int [not null]
  nev nvarchar(150) [not null]

  indexes {
    fejleszto_id [name: 'idx_fejlesztesi_teruletek_fejleszto']
  }
}

Ref: fejlesztopedagogusok.id < fejlesztesi_teruletek.fejleszto_id

Table fejlesztesi_celok {
  id int [pk, increment]
  terulet_id int [not null]
  nev nvarchar(255) [not null]

  indexes {
    terulet_id [name: 'idx_fejlesztesi_celok_terulet']
  }
}

Ref: fejlesztesi_teruletek.id < fejlesztesi_celok.terulet_id

Table fejlesztesi_eszkozok {
  id int [pk, increment]
  cel_id int [not null]
  nev nvarchar(255) [not null]

  indexes {
    cel_id [name: 'idx_fejlesztesi_eszkozok_cel']
  }
}

Ref: fejlesztesi_celok.id < fejlesztesi_eszkozok.cel_id

// ==========================================
// GYERMEKEK ÉS SZAKVÉLEMÉNYEK
// ==========================================

Table gyermekek {
  id int [pk, increment]
  fejleszto_id int [not null]
  iskola_id int [not null]
  aktiv_szv_id int [null, note: 'Az aktuálisan érvényben lévő szakvélemény mutatója']
  nev nvarchar(150) [not null]
  anyja_neve nvarchar(150)
  szuletesi_ideje date
  szuletesi_helye nvarchar(100)

  indexes {
    fejleszto_id [name: 'idx_gyermekek_fejleszto']
    iskola_id [name: 'idx_gyermekek_iskola']
    (fejleszto_id, nev) [name: 'idx_gyermekek_kereses']
  }
}

Ref: fejlesztopedagogusok.id < gyermekek.fejleszto_id
Ref: iskolak.id < gyermekek.iskola_id

Enum fejlesztes_formaja {
  egyeni
  csoportos
}

Table szakvelemenyek {
  id int [pk, increment]
  fejleszto_id int [not null]
  gyermek_id int [not null]
  kiallito_id int [not null]
  iktatasi_szam nvarchar(100)
  nyilvantartasi_szam nvarchar(100)
  kiallitas_ideje date
  felulvizsgalat_kezdo_ev smallint [note: 'pl. 2027 (a 2027/2028-as tanévhez)']
  fejlesztes_formaja fejlesztes_formaja [not null, default: 'egyeni']
  fejlesztes_gyakorisaga nvarchar(100)

  indexes {
    fejleszto_id [name: 'idx_szakvelemenyek_fejleszto']
    gyermek_id [name: 'idx_szakvelemenyek_gyermek']
    kiallito_id [name: 'idx_szakvelemenyek_kiallito']
    (fejleszto_id, felulvizsgalat_kezdo_ev) [name: 'idx_szakvelemenyek_felulvizsgalat']
  }
}

Ref: fejlesztopedagogusok.id < szakvelemenyek.fejleszto_id
Ref: gyermekek.id < szakvelemenyek.gyermek_id
Ref: szakvelemeny_kiallitok.id < szakvelemenyek.kiallito_id
Ref: szakvelemenyek.id - gyermekek.aktiv_szv_id

// ==========================================
// ÉVES ADMINISZTRÁCIÓ ÉS TERVEZÉS
// ==========================================

Table tanev_gyermekek {
  id int [pk, increment]
  fejleszto_id int [not null]
  gyermek_id int [not null]
  tanev_id int [not null]
  osztaly nvarchar(20)

  indexes {
    fejleszto_id [name: 'idx_tanev_gyermekek_fejleszto']
    (tanev_id, gyermek_id) [unique, name: 'uq_tanev_gyermek']
    gyermek_id [name: 'idx_tanev_gyermekek_gyermek']
  }
}

Ref: fejlesztopedagogusok.id < tanev_gyermekek.fejleszto_id
Ref: gyermekek.id < tanev_gyermekek.gyermek_id
Ref: tanevek.id < tanev_gyermekek.tanev_id

Table fejlesztesi_terv_sorok {
  tanev_gyermek_id int [not null]
  fejlesztesi_eszkoz_id int [not null]

  indexes {
    (tanev_gyermek_id, fejlesztesi_eszkoz_id) [pk]
    fejlesztesi_eszkoz_id [name: 'idx_tervsor_eszkoz']
  }
}

Ref: tanev_gyermekek.id < fejlesztesi_terv_sorok.tanev_gyermek_id
Ref: fejlesztesi_eszkozok.id < fejlesztesi_terv_sorok.fejlesztesi_eszkoz_id

// ==========================================
// FOGLALKOZÁSOK ÉS NAPLÓZÁS
// ==========================================

Table foglalkozasok {
  id int [pk, increment]
  fejleszto_id int [not null]
  tanev_id int [not null]
  datum date [not null]

  indexes {
    fejleszto_id [name: 'idx_foglalkozasok_fejleszto']
    (tanev_id, datum) [name: 'idx_foglalkozasok_tanev_datum']
  }
}

Ref: fejlesztopedagogusok.id < foglalkozasok.fejleszto_id
Ref: tanevek.id < foglalkozasok.tanev_id

Table foglalkozason_resztvevo_gyermekek {
  foglalkozas_id int [not null]
  gyermek_id int [not null]

  indexes {
    (foglalkozas_id, gyermek_id) [pk]
    gyermek_id [name: 'idx_resztvevo_gyermek']
  }
}

Ref: foglalkozasok.id < foglalkozason_resztvevo_gyermekek.foglalkozas_id
Ref: gyermekek.id < foglalkozason_resztvevo_gyermekek.gyermek_id

Table foglalkozason_elvegzett_tevekenysegek {
  foglalkozas_id int [not null]
  eszkoz_id int [not null]

  indexes {
    (foglalkozas_id, eszkoz_id) [pk]
    eszkoz_id [name: 'idx_foglalkozas_tevekenyseg_eszkoz']
  }
}

Ref: foglalkozasok.id < foglalkozason_elvegzett_tevekenysegek.foglalkozas_id
Ref: fejlesztesi_eszkozok.id < foglalkozason_elvegzett_tevekenysegek.eszkoz_id
```