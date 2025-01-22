import requests
from bs4 import BeautifulSoup

import mysql.connector

"""
Download the HTML content from the links below, save them with the specified names, and run this script to insert them into the database.
Automated downloading is not used because investing.com blocks non-human requests.

Filename: currencies.html
URL: https://www.investing.com/webmaster-tools/live-currency-cross-rates

Filname: cryptocurrencies.html
URL: https://www.investing.com/webmaster-tools/crypto-currency-rates
"""


def get_db_connection():
    db_config = {
        'user': 'root',
        'password': 'root',
        'host': 'localhost',
        'database': 'investing'
    }
    return mysql.connector.connect(**db_config)

def get_currencies(html_content):
    # Parse the content of the webpage with BeautifulSoup
    soup = BeautifulSoup(html_content, 'html.parser')

    ul = soup.select("#pairsDefaultDiv li")

    # Extract the match names and their URLs
    matches = []
    for li in ul:
        # Find the anchor tags within this section
        currency_name = li.get('title')
        currency_id = li.find('input').get('id')
        matches.append({'id': currency_id, 'name': currency_name})
#        print(currency_name, currency_id)
    return matches

def insert_to_database(matches, currency_type):
    # Connect to the database
    connection = get_db_connection()
    cursor = connection.cursor()

    delete_query ="""
    DELETE FROM currencies WHERE type=%s
    """
    cursor.execute(delete_query, (currency_type, ))

    # Insert data into the database
    insert_query = """
        INSERT INTO currencies (id, name, type)
        VALUES (%s, %s, %s)
        """

    for currency in matches:
        cursor.execute(insert_query, (currency['id'], currency['name'], currency_type))

    # Commit the transaction
    connection.commit()
    cursor.close()
    connection.close()


def crawl(html_file, currency_type):
    # Open the HTML file
    with open(html_file, "r", encoding="utf-8") as file:
        # Read the file content
        html_content = file.read()
    currencies = get_currencies(html_content)
    insert_to_database(currencies, currency_type)

crawl("currencies.html", "currency")
crawl("cryptocurrencies.html", "crypto")
