import requests
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

import mysql.connector

"""
This script gets active currency list from investing listing
"""

# using playwright because investing.com blocking non-human requests.
def download_html(url, output_file):
    with sync_playwright() as p:
        browser = p.firefox.launch(headless=True)  # Use headless mode
        page = browser.new_page()
         # Set custom HTTP headers
        page.set_extra_http_headers({
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9,tr-TR;q=0.8,tr;q=0.7"
        })
        page.goto(url)  # Navigate to the URL
        html_content = page.content()  # Get the page HTML content

        # Save the HTML to a file
        with open(output_file, 'w', encoding='utf-8') as file:
            file.write(html_content)

        print(f"HTML content saved to {output_file}")
        browser.close()


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

        if currency_id == "997650" and currency_name == 'ETH/USD': # this is not work
            continue
        print(currency_id, currency_name)
        matches.append({'id': currency_id, 'name': currency_name})
#        print(currency_name, currency_id)
    return matches

def insert_to_database(matches, currency_type):
    # Connect to the database
    connection = get_db_connection()
    cursor = connection.cursor()

    # Insert data into the database
    insert_query = """
        INSERT INTO currencies (id, name, type)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE
        name = VALUES(name)
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

download_html("https://www.investing.com/webmaster-tools/crypto-currency-rates", "/tmp/cryptocurrencies.html")
download_html("https://www.investing.com/webmaster-tools/live-currency-cross-rates", "/tmp/currencies.html")

crawl("/tmp/currencies.html", "currency")
crawl("/tmp/cryptocurrencies.html", "crypto")
