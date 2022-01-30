using Playnite.SDK;
using Playnite.SDK.Models;
using Playnite.SDK.Plugins;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Windows.Controls;
using HtmlAgilityPack;

namespace DescriptionCleaning {
	public class DescriptionCleaning : GenericPlugin {
		private static readonly ILogger logger = LogManager.GetLogger();
		private static readonly Regex imgSrcRegex = new Regex("(?<=src=\")(.*?)(?=\")");
		private static readonly Regex removeWhitespaceRegex = new Regex(@"\s+");
		private static readonly bool writeLogs = true;

		private DescriptionCleaningSettingsViewModel settings { get; set; }

		public override Guid Id { get; } = Guid.Parse("b657b778-40ea-4202-909d-923bb4d869ab");

		public DescriptionCleaning(IPlayniteAPI api) : base(api) {
			settings = new DescriptionCleaningSettingsViewModel(this);
			Properties = new GenericPluginProperties {
				HasSettings = false
			};
		}

		public override IEnumerable<MainMenuItem> GetMainMenuItems(GetMainMenuItemsArgs args) {
			List<MainMenuItem> mainMenuItems = new List<MainMenuItem> {
				new MainMenuItem {
					MenuSection = "@Cleanup",
					Description = "Download all files",
					Action = (mainMenuItem) =>
					{
						GlobalProgressOptions options = new GlobalProgressOptions("Download all images", true);
						PlayniteApi.Dialogs.ActivateGlobalProgress(DownloadAll, options) ;
					}
				},
				new MainMenuItem {
					MenuSection = "@Cleanup",
					Description = "Clean all descriptions",
					Action = (mainMenuItem) =>
					{
						GlobalProgressOptions options = new GlobalProgressOptions("Clean all descriptions", true);
						PlayniteApi.Dialogs.ActivateGlobalProgress(CleanAll, options) ;
					}
				}
				//new MainMenuItem {
				//	MenuSection = "@Cleanup",
				//	Description = "Update paths",
				//	Action = (mainMenuItem) =>
				//	{
				//		GlobalProgressOptions options = new GlobalProgressOptions("Updating paths", true);
				//		PlayniteApi.Dialogs.ActivateGlobalProgress(UpdatePaths, options) ;
				//	}
				//}
			};

			return mainMenuItems;
		}

		public void LogMessage(string message) {
			if(!writeLogs) {
				return;
      }
			logger.Info("**** " + message);
		}

		public void Error(string message) {
			logger.Error(message);
			PopupMessage(message);
		}

		public void Message(string message) {
			LogMessage(message);
			PopupMessage(message);
		}

		public void PopupMessage(string message) {
			PlayniteApi.Dialogs.ShowMessage(message);
		}

		//public void UpdatePaths(GlobalProgressActionArgs progress) {
		//	foreach (Game game in PlayniteApi.Database.Games) {
		//		LogMessage(game.Name);
		//		if(game.Roms == null) {
		//			continue;
  //      } 
		//		foreach (GameRom rom in game.Roms) {
		//			LogMessage($"install folder is {game.InstallDirectory}");
		//			LogMessage($"rom path is {rom.Path}");
		//			rom.Path = rom.Path.Replace("E:\\Games\\Emulation", "R:\\Emulation");
		//			rom.Path = rom.Path.Replace(game.InstallDirectory, "{InstallDir}\\");
		//			rom.Path = rom.Path.Replace("\\\\", "\\");
		//			LogMessage($"new rom path is {rom.Path}");
		//		}
  //      PlayniteApi.Database.Games.Update(game);
  //    }
  //  }

		public void DownloadAll(GlobalProgressActionArgs progress) {
			LogMessage("Starting download");

			int AllImagesCount = 0;
			progress.CurrentProgressValue = 0;
			progress.ProgressMaxValue = PlayniteApi.Database.Games.Count;

			WebClient client = new WebClient();
			client.Headers.Add("user-agent", "Mikal/1.0 (bob.bobby@bob.com) bot");
			string invalidChars = new string(Path.GetInvalidFileNameChars());
			List<string> ImagesWithError = new List<string>();
			List<string> GamesWithError = new List<string>();

			foreach (Game game in PlayniteApi.Database.Games) {
				// Do stuff with a game
				string description = game.Description;
				bool shouldLogGameName = true;

				progress.CurrentProgressValue++;
				progress.Text = $"Gathering images... ({progress.CurrentProgressValue}/{progress.ProgressMaxValue})";

				if(description == null) {
					Error($"{game.Name} has no description");
					Message(" " + description.Length);
				}

				MatchCollection matches = imgSrcRegex.Matches(description);
				List<string> CheckedImages = new List<string>();
				List<string> ImagesToDownload = new List<string>();

				int imagesChecked = 0;

				foreach (Match match in matches) {
					string url = WebUtility.HtmlDecode(match.Value);
					GroupCollection groups = match.Groups;

					//if (game.Name.Contains("Buu")) {
					//    LogMessage("!!!!!! before: " + match.Value);
					//    LogMessage("!!!!!! after1: " + Uri.UnescapeDataString(match.Value));
					//    LogMessage("!!!!!! after2: " + HttpUtility.UrlDecode(match.Value));
					//    LogMessage("!!!!!! after3: " + WebUtility.HtmlDecode(match.Value));
					//}

					if (url.StartsWith("file:///")) {
						//LogMessage("X| file image, skipping");
						continue;
					}
					if (url.StartsWith("https://static.giantbomb.com/api/")) {
						//LogMessage("X| giantbomb static image, skipping");
						continue;
					}

					url = url.Replace(@"https://static.giantbomb.com/uploads/", @"https://www.giantbomb.com/a/uploads/");

					if (url.StartsWith("data")) {
						//LogMessage("X| data url, skipping");
						continue;
					}

					if (url.Contains("scale_medium")) {
						GetHighestGiantBombQuality(url, "scale_medium");
					}

					if (url.Contains("scale_small")) {
						GetHighestGiantBombQuality(url, "scale_small");
					}

					if (url.Contains("square_avatar")) {
						GetHighestGiantBombQuality(url, "square_avatar");
					}

					if(url.Contains("wikia") && url.Contains("/revision/")) {
						url = url.Split(new string[] { "/revision/" }, StringSplitOptions.None)[0];
					}

					string imageName = GetImageName(url);

					if (CheckedImages.FirstOrDefault(x => x == Path.GetFileNameWithoutExtension(imageName)) != null) {
						//LogMessage("X| already checked, skipping");
						continue;
					}

					var files = Directory.GetFiles(getFilesFolderPath(game), Path.GetFileNameWithoutExtension(imageName) + ".*");
					if (files.Length > 0) {
						//LogMessage("X| file already exists, skipping");
						continue;
					}

					if (shouldLogGameName) {
						LogMessage(game.Name);
						shouldLogGameName = false;
					}
					LogMessage($"will download {url}");

					CheckedImages.Add(Path.GetFileNameWithoutExtension(imageName));
					ImagesToDownload.Add(url);
				}

				foreach (string url in ImagesToDownload) {
					imagesChecked++;
					AllImagesCount++;
					string imageName = GetImageName(url);
					try {
						using (client) {
							client.DownloadFile(new Uri(url).GetLeftPart(UriPartial.Path), getFilesFolderPath(game) + imageName);
						}
					}
					catch (Exception e) {
						ImagesWithError.Add($"{game.Name} => {url} didnt work: {e}");
						GamesWithError.Add(game.Name);
						//throw e;
					}

					progress.Text = $"{progress.CurrentProgressValue}/{progress.ProgressMaxValue}: Downloading image {imagesChecked}/{ImagesToDownload.Count} for {game.Name}";
				}
			}

			string finalMessage = $"Downloaded {AllImagesCount} images";
			if(ImagesWithError.Count > 0) {
				finalMessage += $"; found {ImagesWithError.Count} errors for the following games: {String.Join(", ", GamesWithError)}";
				foreach (string errorImage in ImagesWithError) {
					logger.Error(errorImage);
				}
			}
			Message(finalMessage);
		}

		public void CleanAll(GlobalProgressActionArgs progress) {
			LogMessage("Starting to clean");

			progress.CurrentProgressValue = 0;
			progress.ProgressMaxValue = PlayniteApi.Database.Games.Count;

			int CleanedGames = 0;

			foreach (Game game in PlayniteApi.Database.Games) {
				try {
					if(game.Hidden) {
						LogMessage("Skipping hidden game");
						continue;
          }
					string description = game.Description;
					LogMessage($"cleaning {game.Name}");

					progress.CurrentProgressValue++;
					progress.Text = $"Cleaning metadata... ({progress.CurrentProgressValue}/{progress.ProgressMaxValue})";

					if (description == null) {
						Error($"{game.Name} has no description");
						Message(" " + description.Length);
					}

					string html = @"<!DOCTYPE html>
					<html>
					<body>
						<p>temp</p>
					</body>
					</html> ";


					HtmlDocument htmlDoc = new HtmlDocument();
					htmlDoc.LoadHtml(html);
					HtmlNode body = htmlDoc.DocumentNode.SelectSingleNode("//body");
					body.InnerHtml = description;

					if (body.InnerHtml.Length > description.Length * 1.1 || body.InnerHtml.Length < description.Length * 0.9) {
						Error($"{game.Name}: description has formatting issues");
						LogMessage("DESCRIPTION ==========================================================");
						LogMessage("======================================================================");
						LogMessage("\n" + description);
						LogMessage("HTML ==========================================================");
						LogMessage("======================================================================");
						LogMessage("\n" + body.InnerHtml);
						throw new Exception($"{game.Name}: description has formatting issues");
					}

					htmlDoc.DocumentNode.SelectNodes("//noscript").ForEach((node) => node.Remove());
					//LogMessage("After noscript");
					htmlDoc.DocumentNode.SelectNodes("//h1").ForEach((node) => node.Attributes.RemoveAll());
					//LogMessage("After h1");
					htmlDoc.DocumentNode.SelectNodes("//h2").ForEach((node) => node.Attributes.RemoveAll());
					//LogMessage("After h2");
					htmlDoc.DocumentNode.SelectNodes("//h3").ForEach((node) => node.Attributes.RemoveAll());
					//LogMessage("After h3");
					htmlDoc.DocumentNode.SelectNodes("//h1").ForEach((node) => node.Attributes.RemoveAll());
					//LogMessage("After h4");
					htmlDoc.DocumentNode.SelectNodes("//figure").ForEach((node) => node.Attributes.RemoveAll());
					//LogMessage("After figure");
					htmlDoc.DocumentNode.SelectNodes("//img").ForEach((node) => { CleanImage(node, getFilesFolderPath(game)); });
					//LogMessage("After img");

					Boolean descriptionIsFinished = true;
					if (game.Tags != null) {
						foreach (Tag tag in game.Tags) {
							if (tag.Name == "description") {
								descriptionIsFinished = false;
								break;
							}
						}
					}
					//LogMessage("After tags");

					Tag needsImageTag = PlayniteApi.Database.Tags.FirstOrDefault(x => x.Name == "needsgameplayimage");
					if (descriptionIsFinished) {
						if (htmlDoc.DocumentNode.SelectNodes("//img") == null) {
							if(game.TagIds == null) {
								game.TagIds = new List<Guid>() { needsImageTag.Id };
              }
							else {
								game.TagIds.Add(needsImageTag.Id);
							}
						}
						else {
							HtmlNode image = htmlDoc.DocumentNode.SelectNodes("//img")[0];
							if (image.Attributes["width"] == null) {
								image.Attributes.Add("width", "100%");
							}
							else {
								image.Attributes["width"].Value = "100%";
							}
							if(game.TagIds != null && game.TagIds.Contains(needsImageTag.Id)) {
								game.TagIds.Remove(needsImageTag.Id);
              }
						}
					}
					//LogMessage("After width");

					htmlDoc.DocumentNode.SelectNodes("//a").ForEach((node) => {
						HtmlAttributeCollection linkAttributes = node.Attributes;

						foreach (HtmlAttribute attr in linkAttributes.ToList()) {
							if (attr.Name != "href" && attr.Name != "alt") {
								node.Attributes[attr.Name].Remove();
							}
						}
					});
					
					string result = LastCleanHtml(body.InnerHtml);

					if (result.Length == 0 || removeWhitespaceRegex.Replace(result, "").Length == 0) {
						throw new Exception("Description is empty");
					}

					if (result == description) {
						continue;
					}

					CleanedGames++;
					game.Description = result;
          PlayniteApi.Database.Games.Update(game);
        }
        catch (Exception e) {
					Error(e.ToString());
					throw (e);
				}
			}

			Message($"Cleaned {CleanedGames} games");
		}

		private string getFilesFolderPath(Game game) {
			return "R:/Playnite/library/files/" + game.Id + "/";
		}

		private void CleanImage(HtmlNode image, string folderPath) {
			try {
				if (image.Attributes["src"].Value.StartsWith("file://")) {
					image.Attributes["src"].Value = image.Attributes["src"].Value.Replace("file:///R:/Playnite", "file:///V:/Playnite");
					return;
				}

				HtmlAttributeCollection attributes = image.Attributes;
				foreach (HtmlAttribute attr in attributes.ToList()) {
					if (attr.Name == "src" || attr.Name == "alt" || attr.Name == "width") {
						continue;
					}
					if (attr.Name == "data-src") {
						image.Attributes["src"].Value = attr.Value;
					}
					image.Attributes[attr.Name].Remove();
				}

				string imageName = image.Attributes["src"].Value;
				imageName = imageName.Split(new string[] { "/revision/" }, StringSplitOptions.None)[0];
				imageName = GetImageName(imageName);

				var files = Directory.GetFiles(folderPath, Path.GetFileNameWithoutExtension(imageName) + ".*");
				if (files == null || files.Length == 0) {
					return;
				}
				if (!imageName.EndsWith(".png")) {
					var pngFiles = Directory.GetFiles(folderPath, Path.GetFileNameWithoutExtension(imageName) + ".png");
					if (pngFiles.Length > 0) {
						imageName = Path.GetFileNameWithoutExtension(imageName) + ".png";
					}
				}
				image.Attributes["src"].Value = "file:///" + folderPath + imageName;
			} catch(Exception e) {
				Error(e.ToString());
				throw (e);
      }
		}

		public string GetImageName(string imagePath) {
			return Path.GetFileName(imagePath).Split(char.Parse("?"))[0];
		}

		private string GetHighestGiantBombQuality(string url, string toReplace) {
			if (RemoteFileExists(url.Replace(toReplace, "original"))) {
				return url.Replace(toReplace, "original");
			}
			else if (RemoteFileExists(url.Replace(toReplace, "scale_large"))) {
				return url.Replace(toReplace, "scale_large");
			}
			else if (RemoteFileExists(url.Replace(toReplace, "scale_medium"))) {
				return url.Replace(toReplace, "scale_medium");
			}
			else if (RemoteFileExists(url.Replace(toReplace, "scale_small"))) {
				return url.Replace(toReplace, "scale_small");
			}
			return url;
		}

		private bool RemoteFileExists(string url) {
			try {
				//Creating the HttpWebRequest
				HttpWebRequest request = WebRequest.Create(url) as HttpWebRequest;
				//Setting the Request method HEAD, you can also use GET too.
				request.Method = "HEAD";
				//Getting the Web Response.
				HttpWebResponse response = request.GetResponse() as HttpWebResponse;
				//Returns TRUE if the Status code == 200
				response.Close();
				return (response.StatusCode == HttpStatusCode.OK);
			}
			catch {
				//Any exception will returns false.
				return false;
			}
		}

		private string LastCleanHtml(string htmlContent) {
			htmlContent = htmlContent.Replace("<br>&nbsp;</br>", "");
			htmlContent = htmlContent.Replace("<br> &nbsp;</br>", "");
			htmlContent = htmlContent.Replace("<br>&nbsp; </br>", "");

			htmlContent = htmlContent.Replace("<p> </p>", "");
			htmlContent = htmlContent.Replace("<p></p>", "");
			htmlContent = htmlContent.Replace("<p><br></p>", "");
			htmlContent = htmlContent.Replace("<p> <br></p>", "");
			htmlContent = htmlContent.Replace("<p><br> </p>", "");
			htmlContent = htmlContent.Replace("<p>&nbsp;</p>", "");

			htmlContent = htmlContent.Replace("<b> </b>", "");
			htmlContent = htmlContent.Replace("<b></b>", "");
			htmlContent = htmlContent.Replace("<b><br></b>", "");
			htmlContent = htmlContent.Replace("<b> <br></b>", "");
			htmlContent = htmlContent.Replace("<b><br> </b>", "");
			htmlContent = htmlContent.Replace("<b>&nbsp;</b>", "");

			htmlContent = htmlContent.Replace("<em> </em>", "");
			htmlContent = htmlContent.Replace("<em></em>", "");
			htmlContent = htmlContent.Replace("<em><br></em>", "");
			htmlContent = htmlContent.Replace("<em> <br></em>", "");
			htmlContent = htmlContent.Replace("<em><br> </em>", "");
			htmlContent = htmlContent.Replace("<em>&nbsp;</em>", "");

			htmlContent = htmlContent.Replace("</figure>\n\n", "</figure>");
			htmlContent = htmlContent.Replace("</figure>", "</figure>\n\n");

			htmlContent = htmlContent.Replace("</img>\n\n", "</img>");
			htmlContent = htmlContent.Replace("</img>", "</img>\n\n");
			htmlContent = htmlContent.Replace("</img>\n\n</figure>", "</img></figure>");

			htmlContent = htmlContent.Replace("\n\n<img", "<img");
			htmlContent = htmlContent.Replace("<img", "\n\n<img");

			htmlContent = htmlContent.Replace("</p>\n\n", "</p>");
			htmlContent = htmlContent.Replace("</p>", "</p>\n\n");

			htmlContent = htmlContent.Replace("</h1>\n\n", "</h1>");
			htmlContent = htmlContent.Replace("</h1>", "</h1>\n\n");

			htmlContent = htmlContent.Replace("</h2>\n\n", "</h2>");
			htmlContent = htmlContent.Replace("</h2>", "</h2>\n\n");

			htmlContent = htmlContent.Replace("</h3>\n\n", "</h3>");
			htmlContent = htmlContent.Replace("</h3>", "</h3>\n\n");

			htmlContent = htmlContent.Replace("</h4>\n\n", "</h4>");
			htmlContent = htmlContent.Replace("</h4>", "</h4>\n\n");

			htmlContent = htmlContent.Replace("</ul>\n\n", "</ul>");
			htmlContent = htmlContent.Replace("</ul>", "</ul>\n\n");

			htmlContent = htmlContent.Replace("href=\"/", "href=\"https://www.giantbomb.com/");

			htmlContent.Replace("\n\n\n", "\n\n");
			htmlContent.Replace("\n\n\n", "\n\n");
			htmlContent.Replace("\n\n\n", "\n\n");
			htmlContent.Replace("\n\n\n", "\n\n");
			htmlContent.Replace("\n\n\n", "\n\n");
			htmlContent.Replace("\n\n\n", "\n\n");
			htmlContent.Replace("\n\n\n", "\n\n");
			htmlContent.Replace("\n\n\n", "\n\n");
			htmlContent.Replace("\n\n\n", "\n\n");
			htmlContent.Replace("\n\n\n", "\n\n");
			htmlContent.Replace("\n\n\n", "\n\n");
			return htmlContent;
		}




		public override ISettings GetSettings(bool firstRunSettings) {
			return settings;
		}

		public override UserControl GetSettingsView(bool firstRunSettings) {
			return new DescriptionCleaningSettingsView();
		}
	}
}