#!/usr/bin/env python3

import logging
import re
from typing import Optional

import bs4
from praw.models import Submission

from bdfr.exceptions import SiteDownloaderError
from bdfr.resource import Resource
from bdfr.site_authenticator import SiteAuthenticator
from bdfr.site_downloaders.base_downloader import BaseDownloader

logger = logging.getLogger(__name__)


class DeviantArt(BaseDownloader):
    def __init__(self, post: Submission):
        super().__init__(post)

    def find_resources(self, authenticator: Optional[SiteAuthenticator] = None) -> list[Resource]:
        link = self._get_link(self.post.url)

        if not link:
            raise SiteDownloaderError('DeviantArt parser could not find any link')

        if not re.match(r'https?://.*', link):
            link = 'https://' + link
        return [Resource(self.post, link)]

    @staticmethod
    def _get_link(url: str) -> str:
        page = DeviantArt.retrieve_url(url)
        soup = bs4.BeautifulSoup(page.text, 'html.parser')
        title = soup.find('h1', attrs={'data-hook': 'deviation_title'})
        image = soup.find('img', attrs={'alt': title.string})

        if not image:
            return

        return image.get("src")
