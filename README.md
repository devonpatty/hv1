## Upplýsingar um verkefni 

### Gagnagrunnur og töflur setja upp
    Það er gert manually notar `heroku cli pg:psql` til að tengja við database-ið í heroku og notar queries
    úr schema.sql skjal til að búa til töflur.

### Gögnum komið inn í töflur
    Notar með eina route `/csv` harðkóða staðsetningu á data folder og lesa fyrst gögnin í csv og insert-a
    í töflur.

## Dæmi um köll í vefþjónustu
    ```
    localhost:3000/categories

    [
        {
            "cateid": 158,
            "name": "Economics"
        },
        {
            "cateid": 533,
            "name": "hello"
        },
        {
            "cateid": 102,
            "name": "Design"
        }
    ]
    ```

    ```
    localhost:3000/users

    [
        {
            "username": "anmi"
        },
        {
            "username": "anmi2"
        },
        {
            "username": "anmi3"
        },
        {
            "username": "anmi6"
        },
        {
            "username": "anmineverdie"
        },
        {
            "username": "anmi10"
        }
    ]
    ```

## Nafn
    Hoai Nam Duc Tran hnd1@hi.is
    Jón Rúnar Baldvinsson jrb6@hi.is
    Brynja Pálina Sigurgeirsdóttir bps5@hi.is