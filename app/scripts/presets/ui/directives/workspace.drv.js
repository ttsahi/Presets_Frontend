/**
 * Created by tzachit on 25/11/14.
 */

(function(app){

  'use strict';

  app.directive('workspace', ['$compile', '$q', '$http', '$templateCache', '$animate', 'MVC', 'Preset', 'WorkspaceData',
    function($compile, $q, $http, $templateCache, $animate, MVC, Preset, WorkspaceData) {

      function DeveloperError(message){
        this.message = message;
      }

      function LoadException(message){
        this.message = message;
      }

      function Cursor(side, type) {
        this.side = side;
        this.type = type;
      }

      function Position(x, y){
        this.x = x;
        this.y = y;
      }

      function Container(element, width, height) {
        this.element = element;
        this.width = width || 0;
        this.height = height || 0;
        this.cursor = new Cursor('none', 'initial');
        this.cover = null;
      }

      function PanelSide() {}
      PanelSide.Top = 0;
      PanelSide.TopLeft = 1;
      PanelSide.TopRight = 2;
      PanelSide.Bottom = 3;
      PanelSide.BottomLeft = 4;
      PanelSide.BottomRight = 5;
      PanelSide.Left = 6;
      PanelSide.Right = 7;
      PanelSide.Middle = 8;

      function Corners() {
        this.topLeft = null;
        this.topRight = null;
        this.bottomLeft = null;
        this.bottomRight = null;
      }

      function TempPanel() {
        this.id = null;
        this.position = null;
        this.inUse = false;
        this.referTo = null;
        this.children = [];
        this.corners = null;
        this.container = null;
      }

      function convertPositionToIndex(x, y, cols) {
        return y * cols + x;
      }

      function getHitArea(width, height, x, y) {

        var edgeOffset = 10;

        if (x >= 0 && x <= edgeOffset && y >= 0 && y <= edgeOffset) {
          return PanelSide.TopLeft;
        }

        if (x <= width && x >= (width - edgeOffset) && y >= 0 && y <= edgeOffset) {
          return PanelSide.TopRight;
        }

        if (x >= 0 && x <= edgeOffset && y <= height && y >= (height - edgeOffset)) {
          return PanelSide.BottomLeft;
        }

        if (x <= width && x >= (width - edgeOffset) && y <= height && y >= (height - edgeOffset)) {
          return PanelSide.BottomRight;
        }

        if (y < edgeOffset && x > edgeOffset && x < (width - edgeOffset)) {
          return PanelSide.Top;
        }

        if (y > (height - edgeOffset) && x > edgeOffset && x < (width - edgeOffset)) {
          return PanelSide.Bottom;
        }

        if (x < edgeOffset && y > edgeOffset && y < (height - edgeOffset)) {
          return PanelSide.Left;
        }

        if (x > (width - edgeOffset) && y > edgeOffset && y < (height - edgeOffset)) {
          return PanelSide.Right;
        }

        return PanelSide.Middle;
      }

      function getCursorType(panelSide) {
        switch (panelSide) {
          case PanelSide.Top:
            return 'n-resize';
          case PanelSide.Bottom:
            return 'ns-resize';
          case PanelSide.Left:
            return 'ew-resize';
          case PanelSide.Right:
            return 'ew-resize';
          case PanelSide.TopLeft:
            return 'nwse-resize';
          case PanelSide.TopRight:
            return 'nesw-resize';
          case PanelSide.BottomLeft:
            return 'nesw-resize';
          case PanelSide.BottomRight:
            return 'nwse-resize';
          default :
            return 'initial';
        }
      }

      function ResizeOptions() {
        this.inc = false;
        this.dec = false;
        this.tempPanels = [];
        this.optionalPanels = null;
      }

      function getAndCheckTop(panel, cols, panels) {
        var first = panels[panel.id - cols];
        var topPanels = [];

        if (first.inUse) {
          return false;
        }

        topPanels.push(first);

        if (panel.corners === null || panel.corners.topLeft === panel.corners.topRight) {
          return {
            topPanels: topPanels,
            topLeftCorner: first,
            topRightCorner: first
          };
        }

        var lastIndex = panel.corners.topRight.id - cols;

        for (var i = first.id + 1; i <= lastIndex; i++) {
          if (panels[i].inUse) {
            return false;
          }

          topPanels.push(panels[i]);
        }

        return {
          topPanels: topPanels,
          topLeftCorner: first,
          topRightCorner: topPanels[topPanels.length - 1]
        };
      }

      function getAndCheckLeft(panel, cols, panels) {
        var first = panels[panel.id - 1];
        var leftPanels = [];

        if (first.inUse) {
          return false;
        }

        leftPanels.push(first);

        if (panel.corners === null || panel.corners.topLeft === panel.corners.bottomLeft) {
          return {
            leftPanels: leftPanels,
            topLeftCorner: first,
            bottomLeftCorner: first
          };
        }

        var lastIndex = panel.corners.bottomLeft.id - 1;

        for (var i = first.id + cols; i <= lastIndex; i += cols) {
          if (panels[i].inUse) {
            return false;
          }

          leftPanels.push(panels[i]);
        }

        return {
          leftPanels: leftPanels,
          topLeftCorner: first,
          bottomLeftCorner: leftPanels[leftPanels.length - 1]
        };
      }

      function getAndCheckRight(panel, cols, panels) {
        var rightPanels = [];
        var first = null;

        if (panel.corners === null) {
          first = panels[panel.id + 1];

          if (first.inUse) {
            return false;
          }

          rightPanels.push(first);

          return {
            rightPanels: rightPanels,
            topRightCorner: first,
            bottomRightCorner: first
          };
        }

        first = panels[panel.corners.topRight.id + 1];

        if (first.inUse) {
          return false;
        }

        rightPanels.push(first);

        if (panel.corners.topRight === panel.corners.bottomRight) {
          return {
            rightPanels: rightPanels,
            topRightCorner: first,
            bottomRightCorner: first
          };
        }

        var lastIndex =  panel.corners.bottomRight.id + 1;

        for (var i = first.id + cols; i <= lastIndex; i += cols) {
          if (panels[i].inUse) {
            return false;
          }

          rightPanels.push(panels[i]);
        }

        return {
          rightPanels: rightPanels,
          topRightCorner: first,
          bottomRightCorner: rightPanels[rightPanels.length - 1]
        };
      }

      function getAndCheckBottom(panel, cols, panels) {
        var bottomPanels = [];
        var first = null;

        if (panel.corners === null) {
          first = panels[panel.id + cols];

          if (first.inUse) {
            return false;
          }

          bottomPanels.push(first);

          return {
            bottomPanels: bottomPanels,
            bottomLeftCorner: first,
            bottomRightCorner: first
          };
        }

        first = panels[panel.corners.bottomLeft.id + cols];

        if (first.inUse) {
          return false;
        }

        bottomPanels.push(first);

        if (panel.corners.bottomLeft === panel.corners.bottomRight) {
          return {
            bottomPanels: bottomPanels,
            bottomLeftCorner: first,
            bottomRightCorner: first
          };
        }

        var lastIndex = panel.corners.bottomRight.id + cols;

        for (var i = first.id + 1; i <= lastIndex; i++) {
          if (panels[i].inUse) {
            return false;
          }

          bottomPanels.push(panels[i]);
        }

        return {
          bottomPanels: bottomPanels,
          bottomLeftCorner: first,
          bottomRightCorner: bottomPanels[bottomPanels.length - 1]
        };
      }

      //panel = selected corner
      function getResizeOptions(panel, selectedSide, cols, rows, panels) {
        var options = new ResizeOptions();
        var panelId = panel.id;
        var position = panel.position;
        var optionalPanels = [];
        var tempPanel = [];
        var tempPanels = [];

        panel = panel.referTo ? panel.referTo : panel;

        if (panel.children.length === 0) {
          options.dec = false;
        }else{
          for(var i = 0; i  < panel.children.length; i++){
            optionalPanels.push(panel.children[i]);
          }

          options.dec = true;
        }

        options.inc = false;

        var cornerPanel = null;
        var topPanel = null;
        var leftPanel = null;
        var rightPanel = null;
        var bottomPanel = null;
        var topResult = null;
        var leftResult = null;
        var rightResult = null;
        var bottomResult = null;

        if (selectedSide === PanelSide.TopLeft) {

          cornerPanel = panels[panelId - 1 - cols];
          topPanel = panels[panelId - cols];
          leftPanel = panels[panelId- 1];
          topResult = null;
          leftResult = null;

          if (position.x - 1 >= 0 && position.y - 1 >= 0 && !cornerPanel.inUse) {

            topResult = getAndCheckTop(panel, cols, panels);
            leftResult = getAndCheckLeft(panel, cols, panels);

            if (topResult && leftResult) {
              options.inc = true;
              optionalPanels.push(cornerPanel);
              optionalPanels = optionalPanels.concat(topResult.topPanels);
              optionalPanels = optionalPanels.concat(leftResult.leftPanels);
              tempPanel = new TempPanel();
              tempPanel.id = cornerPanel.id;
              tempPanel.position = cornerPanel.position;
              tempPanel.referTo = new TempPanel();
              tempPanel.referTo.corners = new Corners();
              tempPanel.referTo.corners.topLeft = cornerPanel;
              tempPanel.referTo.corners.topRight = topResult.topRightCorner;
              tempPanel.referTo.corners.bottomLeft = leftResult.bottomLeftCorner;
              tempPanel.referTo.corners.bottomRight = panel.corners ? panel.corners.bottomRight : panel;
              tempPanel.referTo.position = cornerPanel.position;
              tempPanel.referTo.id = cornerPanel.id;
              tempPanels.push(tempPanel);
            }else if (topResult) {
              options.inc = true;
              optionalPanels = optionalPanels.concat(topResult.topPanels);
              tempPanel = new TempPanel();
              tempPanel.id = topResult.topLeftCorner.id;
              tempPanel.position = topResult.topLeftCorner.position;
              tempPanel.referTo = new TempPanel();
              tempPanel.referTo.corners = new Corners();
              tempPanel.referTo.corners.topLeft = topResult.topLeftCorner;
              tempPanel.referTo.corners.topRight = topResult.topRightCorner;
              tempPanel.referTo.corners.bottomLeft = panel.corners ? panel.corners.bottomLeft : panel;
              tempPanel.referTo.corners.bottomRight = panel.corners ? panel.corners.bottomRight : panel;
              tempPanel.referTo.position = topResult.topLeftCorner.position;
              tempPanel.referTo.id = topResult.topLeftCorner.id;
              tempPanels.push(tempPanel);
            }else if (leftResult) {
              options.inc = true;
              optionalPanels = optionalPanels.concat(leftResult.leftPanels);
              tempPanel = new TempPanel();
              tempPanel.id = leftResult.topLeftCorner.id;
              tempPanel.position = leftResult.topLeftCorner.position;
              tempPanel.referTo = new TempPanel();
              tempPanel.referTo.corners = new Corners();
              tempPanel.referTo.corners.topLeft = leftResult.topLeftCorner;
              tempPanel.referTo.corners.topRight = panel.corners ? panel.corners.topRight : panel;
              tempPanel.referTo.corners.bottomLeft = leftResult.bottomLeftCorner;
              tempPanel.referTo.corners.bottomRight = panel.corners ? panel.corners.bottomRight : panel;
              tempPanel.referTo.position = leftResult.topLeftCorner.position;
              tempPanel.referTo.id = leftResult.topLeftCorner.id;
              tempPanels.push(tempPanel);
            }

          } else {

            if (position.y - 1 >= 0 && !topPanel.inUse) {

              topResult = getAndCheckTop(panel, cols, panels);

              if (topResult) {
                options.inc = true;
                optionalPanels = optionalPanels.concat(topResult.topPanels);
                tempPanel = new TempPanel();
                tempPanel.id = topResult.topLeftCorner.id;
                tempPanel.position = topResult.topLeftCorner.position;
                tempPanel.referTo = new TempPanel();
                tempPanel.referTo.corners = new Corners();
                tempPanel.referTo.corners.topLeft = topResult.topLeftCorner;
                tempPanel.referTo.corners.topRight = topResult.topRightCorner;
                tempPanel.referTo.corners.bottomLeft = panel.corners ? panel.corners.bottomLeft : panel;
                tempPanel.referTo.corners.bottomRight = panel.corners ? panel.corners.bottomRight : panel;
                tempPanel.referTo.position = topResult.topLeftCorner.position;
                tempPanel.referTo.id = topResult.topLeftCorner.id;
                tempPanels.push(tempPanel);
              }
            }

            if (position.x - 1 >= 0 && !leftPanel.inUse) {

              leftResult = getAndCheckLeft(panel, cols, panels);

              if (leftResult) {
                options.inc = true;
                optionalPanels = optionalPanels.concat(leftResult.leftPanels);
                tempPanel = new TempPanel();
                tempPanel.id = leftResult.topLeftCorner.id;
                tempPanel.position = leftResult.topLeftCorner.position;
                tempPanel.referTo = new TempPanel();
                tempPanel.referTo.corners = new Corners();
                tempPanel.referTo.corners.topLeft = leftResult.topLeftCorner;
                tempPanel.referTo.corners.topRight = panel.corners ? panel.corners.topRight : panel;
                tempPanel.referTo.corners.bottomLeft = leftResult.bottomLeftCorner;
                tempPanel.referTo.corners.bottomRight = panel.corners ? panel.corners.bottomRight : panel;
                tempPanel.referTo.position = leftResult.topLeftCorner.position;
                tempPanel.referTo.id = leftResult.topLeftCorner.id;
                tempPanels.push(tempPanel);
              }
            }

          }

        } else if (selectedSide === PanelSide.TopRight) {

          cornerPanel = panels[panelId + 1 - cols];
          topPanel = panels[panelId - cols];
          rightPanel = panels[panelId + 1];
          topResult = null;
          rightResult = null;

          if (position.x + 1 < cols && position.y - 1 >= 0 && !cornerPanel.inUse) {

            topResult = getAndCheckTop(panel, cols, panels);
            rightResult = getAndCheckRight(panel, cols, panels);

            if (topResult && rightResult) {
              options.inc = true;
              optionalPanels.push(cornerPanel);
              optionalPanels = optionalPanels.concat(topResult.topPanels);
              optionalPanels = optionalPanels.concat(rightResult.rightPanels);
              tempPanel = new TempPanel();
              tempPanel.id = cornerPanel.id;
              tempPanel.position = cornerPanel.position;
              tempPanel.referTo = new TempPanel();
              tempPanel.referTo.corners = new Corners();
              tempPanel.referTo.corners.topLeft = topResult.topLeftCorner;
              tempPanel.referTo.corners.topRight = cornerPanel;
              tempPanel.referTo.corners.bottomLeft = panel.corners ? panel.corners.bottomLeft : panel;
              tempPanel.referTo.corners.bottomRight = rightResult.bottomRightCorner;
              tempPanel.referTo.position = topResult.topLeftCorner.position;
              tempPanel.referTo.id = topResult.topLeftCorner.id;
              tempPanels.push(tempPanel);
            } else if (topResult) {
              options.inc = true;
              optionalPanels = optionalPanels.concat(topResult.topPanels);
              tempPanel = new TempPanel();
              tempPanel.id = topResult.topRightCorner.id;
              tempPanel.position = topResult.topRightCorner.position;
              tempPanel.referTo = new TempPanel();
              tempPanel.referTo.corners = new Corners();
              tempPanel.referTo.corners.topLeft = topResult.topLeftCorner;
              tempPanel.referTo.corners.topRight = topResult.topRightCorner;
              tempPanel.referTo.corners.bottomLeft = panel.corners ? panel.corners.bottomLeft : panel;
              tempPanel.referTo.corners.bottomRight = panel.corners ? panel.corners.bottomRight : panel;
              tempPanel.referTo.position = topResult.topLeftCorner.position;
              tempPanel.referTo.id = topResult.topLeftCorner.id;
              tempPanels.push(tempPanel);
            } else if (rightResult) {
              options.inc = true;
              optionalPanels = optionalPanels.concat(rightResult.rightPanels);
              tempPanel = new TempPanel();
              tempPanel.id = rightResult.topRightCorner.id;
              tempPanel.position = rightResult.topRightCorner.position;
              tempPanel.referTo = new TempPanel();
              tempPanel.referTo.corners = new Corners();
              tempPanel.referTo.corners.topLeft = panel.corners ? panel.corners.topLeft : panel;
              tempPanel.referTo.corners.topRight = rightResult.topRightCorner;
              tempPanel.referTo.corners.bottomLeft = panel.corners ? panel.corners.bottomLeft : panel;
              tempPanel.referTo.corners.bottomRight = rightResult.bottomRightCorner;
              tempPanel.referTo.position = tempPanel.referTo.corners.topLeft.position;
              tempPanel.referTo.id = tempPanel.referTo.corners.topLeft.id;
              tempPanels.push(tempPanel);
            }

          } else {

            if (position.y - 1 >= 0 && !topPanel.inUse) {

              topResult = getAndCheckTop(panel, cols, panels);

              if (topResult) {
                options.inc = true;
                optionalPanels = optionalPanels.concat(topResult.topPanels);
                tempPanel = new TempPanel();
                tempPanel.id = topResult.topRightCorner.id;
                tempPanel.position = topResult.topRightCorner.position;
                tempPanel.referTo = new TempPanel();
                tempPanel.referTo.corners = new Corners();
                tempPanel.referTo.corners.topLeft = topResult.topLeftCorner;
                tempPanel.referTo.corners.topRight = topResult.topRightCorner;
                tempPanel.referTo.corners.bottomLeft = panel.corners ? panel.corners.bottomLeft : panel;
                tempPanel.referTo.corners.bottomRight = panel.corners ? panel.corners.bottomRight : panel;
                tempPanel.referTo.position = topResult.topLeftCorner.position;
                tempPanel.referTo.id = topResult.topLeftCorner.id;
                tempPanels.push(tempPanel);
              }
            }

            if (position.x + 1 < cols && !rightPanel.inUse) {

              rightResult = getAndCheckRight(panel, cols, panels);

              if (rightResult) {
                options.inc = true;
                optionalPanels = optionalPanels.concat(rightResult.rightPanels);
                tempPanel = new TempPanel();
                tempPanel.id = rightResult.topRightCorner.id;
                tempPanel.position = rightResult.topRightCorner.position;
                tempPanel.referTo = new TempPanel();
                tempPanel.referTo.corners = new Corners();
                tempPanel.referTo.corners.topLeft = panel.corners ? panel.corners.topLeft : panel;
                tempPanel.referTo.corners.topRight = rightResult.topRightCorner;
                tempPanel.referTo.corners.bottomLeft = panel.corners ? panel.corners.bottomLeft : panel;
                tempPanel.referTo.corners.bottomRight = rightResult.bottomRightCorner;
                tempPanel.referTo.position = tempPanel.referTo.corners.topLeft.position;
                tempPanel.referTo.id = tempPanel.referTo.corners.topLeft.id;
                tempPanels.push(tempPanel);
              }
            }

          }

        } else if (selectedSide === PanelSide.BottomLeft) {

          cornerPanel = panels[panelId - 1 + cols];
          bottomPanel = panels[panelId + cols];
          leftPanel = panels[panelId - 1];
          bottomResult = null;
          leftResult = null;

          if (position.x - 1 >= 0 && position.y + 1 < rows && !cornerPanel.inUse) {

            bottomResult = getAndCheckBottom(panel, cols, panels);
            leftResult = getAndCheckLeft(panel, cols, panels);

            if (bottomResult && leftResult) {
              options.inc = true;
              optionalPanels.push(cornerPanel);
              optionalPanels = optionalPanels.concat(bottomResult.bottomPanels);
              optionalPanels = optionalPanels.concat(leftResult.leftPanels);
              tempPanel = new TempPanel();
              tempPanel.id = cornerPanel.id;
              tempPanel.position = cornerPanel.position;
              tempPanel.referTo = new TempPanel();
              tempPanel.referTo.corners = new Corners();
              tempPanel.referTo.corners.topLeft = leftResult.topLeftCorner;
              tempPanel.referTo.corners.topRight = panel.corners ? panel.corners.topRight : panel;
              tempPanel.referTo.corners.bottomLeft = cornerPanel;
              tempPanel.referTo.corners.bottomRight = bottomResult.bottomRightCorner;
              tempPanel.referTo.position = leftResult.topLeftCorner.position;
              tempPanel.referTo.id = leftResult.topLeftCorner.id;
              tempPanels.push(tempPanel);
            } else if (bottomResult) {
              options.inc = true;
              optionalPanels = optionalPanels.concat(bottomResult.bottomPanels);
              tempPanel = new TempPanel();
              tempPanel.id = bottomResult.bottomLeftCorner.id;
              tempPanel.position = bottomResult.bottomLeftCorner.position;
              tempPanel.referTo = new TempPanel();
              tempPanel.referTo.corners = new Corners();
              tempPanel.referTo.corners.topLeft = panel.corners ? panel.corners.topLeft : panel;
              tempPanel.referTo.corners.topRight = panel.corners ? panel.corners.topRight : panel;
              tempPanel.referTo.corners.bottomLeft = bottomResult.bottomLeftCorner;
              tempPanel.referTo.corners.bottomRight = bottomResult.bottomRightCorner;
              tempPanel.referTo.position = tempPanel.referTo.corners.topLeft.position;
              tempPanel.referTo.id = tempPanel.referTo.corners.topLeft.id;
              tempPanels.push(tempPanel);
            } else if (leftResult) {
              options.inc = true;
              optionalPanels = optionalPanels.concat(leftResult.leftPanels);
              tempPanel = new TempPanel();
              tempPanel.id = leftResult.bottomLeftCorner.id;
              tempPanel.position = leftResult.bottomLeftCorner.position;
              tempPanel.referTo = new TempPanel();
              tempPanel.referTo.corners = new Corners();
              tempPanel.referTo.corners.topLeft = leftResult.topLeftCorner;
              tempPanel.referTo.corners.topRight = panel.corners ? panel.corners.topRight : panel;
              tempPanel.referTo.corners.bottomLeft = leftResult.bottomLeftCorner;
              tempPanel.referTo.corners.bottomRight = panel.corners ? panel.corners.bottomRight : panel;
              tempPanel.referTo.position = leftResult.topLeftCorner.position;
              tempPanel.referTo.id = leftResult.topLeftCorner.id;
              tempPanels.push(tempPanel);
            }

          } else {

            if (position.y + 1 < rows && !bottomPanel.inUse) {

              bottomResult = getAndCheckBottom(panel, cols, panels);

              if (bottomResult) {
                options.inc = true;
                optionalPanels = optionalPanels.concat(bottomResult.bottomPanels);
                tempPanel = new TempPanel();
                tempPanel.id = bottomResult.bottomLeftCorner.id;
                tempPanel.position = bottomResult.bottomLeftCorner.position;
                tempPanel.referTo = new TempPanel();
                tempPanel.referTo.corners = new Corners();
                tempPanel.referTo.corners.topLeft = panel.corners ? panel.corners.topLeft : panel;
                tempPanel.referTo.corners.topRight = panel.corners ? panel.corners.topRight : panel;
                tempPanel.referTo.corners.bottomLeft = bottomResult.bottomLeftCorner;
                tempPanel.referTo.corners.bottomRight = bottomResult.bottomRightCorner;
                tempPanel.referTo.position = tempPanel.referTo.corners.topLeft.position;
                tempPanel.referTo.id = tempPanel.referTo.corners.topLeft.id;
                tempPanels.push(tempPanel);
              }
            }

            if (position.x - 1 >= 0 && !leftPanel.inUse) {

              leftResult = getAndCheckLeft(panel, cols, panels);

              if (leftResult) {
                options.inc = true;
                optionalPanels = optionalPanels.concat(leftResult.leftPanels);
                tempPanel = new TempPanel();
                tempPanel.id = leftResult.bottomLeftCorner.id;
                tempPanel.position = leftResult.bottomLeftCorner.position;
                tempPanel.referTo = new TempPanel();
                tempPanel.referTo.corners = new Corners();
                tempPanel.referTo.corners.topLeft = leftResult.topLeftCorner;
                tempPanel.referTo.corners.topRight = panel.corners ? panel.corners.topRight : panel;
                tempPanel.referTo.corners.bottomLeft = leftResult.bottomLeftCorner;
                tempPanel.referTo.corners.bottomRight = panel.corners ? panel.corners.bottomRight : panel;
                tempPanel.referTo.position = leftResult.topLeftCorner.position;
                tempPanel.referTo.id = leftResult.topLeftCorner.id;
                tempPanels.push(tempPanel);
              }
            }

          }

        } else if (selectedSide === PanelSide.BottomRight) {

          cornerPanel = panels[panelId + 1 + cols];
          bottomPanel = panels[panelId +cols];
          rightPanel = panels[panelId + 1];
          bottomResult = null;
          rightResult = null;

          if (position.x + 1 < cols && position.y + 1 < rows && !cornerPanel.inUse) {

            bottomResult = getAndCheckBottom(panel, cols, panels);
            rightResult = getAndCheckRight(panel, cols, panels);

            if (bottomResult && rightResult) {
              options.inc = true;
              optionalPanels.push(cornerPanel);
              optionalPanels = optionalPanels.concat(bottomResult.bottomPanels);
              optionalPanels = optionalPanels.concat(rightResult.rightPanels);
              tempPanel = new TempPanel();
              tempPanel.id = cornerPanel.id;
              tempPanel.position = cornerPanel.position;
              tempPanel.referTo = new TempPanel();
              tempPanel.referTo.corners = new Corners();
              tempPanel.referTo.corners.topLeft = panel.corners ? panel.corners.topLeft : panel;
              tempPanel.referTo.corners.topRight = rightResult.topRightCorner;
              tempPanel.referTo.corners.bottomLeft = bottomResult.bottomLeftCorner;
              tempPanel.referTo.corners.bottomRight = cornerPanel;
              tempPanel.referTo.position = tempPanel.referTo.corners.topLeft.position;
              tempPanel.referTo.id = tempPanel.referTo.corners.topLeft.id;
              tempPanels.push(tempPanel);
            } else if (bottomResult) {
              options.inc = true;
              optionalPanels = optionalPanels.concat(bottomResult.bottomPanels);
              tempPanel = new TempPanel();
              tempPanel.id = bottomResult.bottomRightCorner.id;
              tempPanel.position = bottomResult.bottomRightCorner.position;
              tempPanel.referTo = new TempPanel();
              tempPanel.referTo.corners = new Corners();
              tempPanel.referTo.corners.topLeft = panel.corners ? panel.corners.topLeft : panel;
              tempPanel.referTo.corners.topRight = panel.corners ? panel.corners.topRight : panel;
              tempPanel.referTo.corners.bottomLeft = bottomResult.bottomLeftCorner;
              tempPanel.referTo.corners.bottomRight = bottomResult.bottomRightCorner;
              tempPanel.referTo.position = tempPanel.referTo.corners.topLeft.position;
              tempPanel.referTo.id = tempPanel.referTo.corners.topLeft.id;
              tempPanels.push(tempPanel);
            } else if (rightResult) {
              options.inc = true;
              optionalPanels = optionalPanels.concat(rightResult.rightPanels);
              tempPanel = new TempPanel();
              tempPanel.id = rightResult.bottomRightCorner.id;
              tempPanel.position = rightResult.bottomRightCorner.position;
              tempPanel.referTo = new TempPanel();
              tempPanel.referTo.corners = new Corners();
              tempPanel.referTo.corners.topLeft = panel.corners ? panel.corners.topLeft : panel;
              tempPanel.referTo.corners.topRight = rightResult.topRightCorner;
              tempPanel.referTo.corners.bottomLeft = panel.corners ? panel.corners.bottomLeft : panel;
              tempPanel.referTo.corners.bottomRight = rightResult.bottomRightCorner;
              tempPanel.referTo.position = tempPanel.referTo.corners.topLeft.position;
              tempPanel.referTo.id = tempPanel.referTo.corners.topLeft.id;
              tempPanels.push(tempPanel);
            }

          } else {

            if (position.y + 1 < rows && !bottomPanel.inUse) {

              bottomResult = getAndCheckBottom(panel, cols, panels);

              if (bottomResult) {
                options.inc = true;
                optionalPanels = optionalPanels.concat(bottomResult.bottomPanels);
                tempPanel = new TempPanel();
                tempPanel.id = bottomResult.bottomRightCorner.id;
                tempPanel.position = bottomResult.bottomRightCorner.position;
                tempPanel.referTo = new TempPanel();
                tempPanel.referTo.corners = new Corners();
                tempPanel.referTo.corners.topLeft = panel.corners ? panel.corners.topLeft : panel;
                tempPanel.referTo.corners.topRight = panel.corners ? panel.corners.topRight : panel;
                tempPanel.referTo.corners.bottomLeft = bottomResult.bottomLeftCorner;
                tempPanel.referTo.corners.bottomRight = bottomResult.bottomRightCorner;
                tempPanel.referTo.position = tempPanel.referTo.corners.topLeft.position;
                tempPanel.referTo.id = tempPanel.referTo.corners.topLeft.id;
                tempPanels.push(tempPanel);
              }
            }

            if (position.x + 1 < cols && !rightPanel.inUse) {

              rightResult = getAndCheckRight(panel, cols, panels);

              if (rightResult) {
                options.inc = true;
                optionalPanels = optionalPanels.concat(rightResult.rightPanels);
                tempPanel = new TempPanel();
                tempPanel.id = rightResult.bottomRightCorner.id;
                tempPanel.position = rightResult.bottomRightCorner.position;
                tempPanel.referTo = new TempPanel();
                tempPanel.referTo.corners = new Corners();
                tempPanel.referTo.corners.topLeft = panel.corners ? panel.corners.topLeft : panel;
                tempPanel.referTo.corners.topRight = rightResult.topRightCorner;
                tempPanel.referTo.corners.bottomLeft = panel.corners ? panel.corners.bottomLeft : panel;
                tempPanel.referTo.corners.bottomRight = rightResult.bottomRightCorner;
                tempPanel.referTo.position = tempPanel.referTo.corners.topLeft.position;
                tempPanel.referTo.id = tempPanel.referTo.corners.topLeft.id;
                tempPanels.push(tempPanel);
              }
            }

          }

        } else if (selectedSide === PanelSide.Top) {

          topPanel = panels[panelId - cols];
          topResult = null;

          if (position.y - 1 >= 0 && !topPanel.inUse) {

            topResult = getAndCheckTop(panel, cols, panels);

            if (topResult) {
              options.inc = true;
              optionalPanels = optionalPanels.concat(topResult.topPanels);
              tempPanel = new TempPanel();
              tempPanel.id = topResult.topLeftCorner.id;
              tempPanel.position = topResult.topLeftCorner.position;
              tempPanel.referTo = new TempPanel();
              tempPanel.referTo.corners = new Corners();
              tempPanel.referTo.corners.topLeft = topResult.topLeftCorner;
              tempPanel.referTo.corners.topRight = topResult.topRightCorner;
              tempPanel.referTo.corners.bottomLeft = panel.corners ? panel.corners.bottomLeft : panel;
              tempPanel.referTo.corners.bottomRight = panel.corners ? panel.corners.bottomRight : panel;
              tempPanel.referTo.position = topResult.topLeftCorner.position;
              tempPanel.referTo.id = topResult.topLeftCorner.id;
              tempPanels.push(tempPanel);
            }
          }

        } else if (selectedSide === PanelSide.Bottom) {

          bottomPanel = panels[panelId + cols];
          bottomResult = null;

          if (position.y + 1 < rows && !bottomPanel.inUse) {

            bottomResult = getAndCheckBottom(panel, cols, panels);

            if (bottomResult) {
              options.inc = true;
              optionalPanels = optionalPanels.concat(bottomResult.bottomPanels);
              tempPanel = new TempPanel();
              tempPanel.id = bottomResult.bottomLeftCorner.id;
              tempPanel.position = bottomResult.bottomLeftCorner.position;
              tempPanel.referTo = new TempPanel();
              tempPanel.referTo.corners = new Corners();
              tempPanel.referTo.corners.topLeft = panel.corners ? panel.corners.topLeft : panel;
              tempPanel.referTo.corners.topRight = panel.corners ? panel.corners.topRight : panel;
              tempPanel.referTo.corners.bottomLeft = bottomResult.bottomLeftCorner;
              tempPanel.referTo.corners.bottomRight = bottomResult.bottomRightCorner;
              tempPanel.referTo.position = tempPanel.referTo.corners.topLeft.position;
              tempPanel.referTo.id = tempPanel.referTo.corners.topLeft.id;
              tempPanels.push(tempPanel);
            }
          }

        } else if (selectedSide === PanelSide.Left) {

          leftPanel = panels[panelId - 1];
          rightResult = null;

          if (position.x - 1 >= 0 && !leftPanel.inUse) {

            leftResult = getAndCheckLeft(panel, cols, panels);

            if (leftResult) {
              options.inc = true;
              optionalPanels = optionalPanels.concat(leftResult.leftPanels);
              tempPanel = new TempPanel();
              tempPanel.id = leftResult.topLeftCorner.id;
              tempPanel.position = leftResult.topLeftCorner.position;
              tempPanel.referTo = new TempPanel();
              tempPanel.referTo.corners = new Corners();
              tempPanel.referTo.corners.topLeft = leftResult.topLeftCorner;
              tempPanel.referTo.corners.topRight = panel.corners ? panel.corners.topRight : panel;
              tempPanel.referTo.corners.bottomLeft = leftResult.bottomLeftCorner;
              tempPanel.referTo.corners.bottomRight = panel.corners ? panel.corners.bottomRight : panel;
              tempPanel.referTo.position = leftResult.topLeftCorner.position;
              tempPanel.referTo.id = leftResult.topLeftCorner.id;
              tempPanels.push(tempPanel);
            }
          }

        } else if (selectedSide === PanelSide.Right) {

          rightPanel = panels[panelId + 1];
          rightResult = null;

          if (position.x + 1 < cols && !rightPanel.inUse) {

            rightResult = getAndCheckRight(panel, cols, panels);

            if (rightResult) {
              options.inc = true;
              optionalPanels = optionalPanels.concat(rightResult.rightPanels);
              tempPanel = new TempPanel();
              tempPanel.id = rightResult.topRightCorner.id;
              tempPanel.position = rightResult.topRightCorner.position;
              tempPanel.referTo = new TempPanel();
              tempPanel.referTo.corners = new Corners();
              tempPanel.referTo.corners.topLeft = panel.corners ? panel.corners.topLeft : panel;
              tempPanel.referTo.corners.topRight = rightResult.topRightCorner;
              tempPanel.referTo.corners.bottomLeft = panel.corners ? panel.corners.bottomLeft : panel;
              tempPanel.referTo.corners.bottomRight = rightResult.bottomRightCorner;
              tempPanel.referTo.position = tempPanel.referTo.corners.topLeft.position;
              tempPanel.referTo.id = tempPanel.referTo.corners.topLeft.id;
              tempPanels.push(tempPanel);
            }
          }

        }

        options.tempPanels = tempPanels;
        options.optionalPanels = optionalPanels;
        return options;
      }

      function getPanelChildren(panel, cols, panels){

        var children = [];
        var corners = panel.corners;
        var idX = 0;
        var idY = 0;

        if(corners.topLeft === corners.topRight){

          for(idY = corners.topLeft.id; idY <= corners.bottomLeft.id; idY += cols){
            children.push(panels[idY])
          }

        }else if(corners.topLeft === corners.bottomLeft){

          for(idX = corners.topLeft.id; idX <= corners.topRight.id; idX++){
            children.push(panels[idX])
          }

        }else{

          for(var y = corners.topLeft.position.y; y <= corners.bottomRight.position.y; y++){
            for(var x = corners.topLeft.position.x; x <= corners.bottomRight.position.x; x++){
              children.push(panels[convertPositionToIndex(x, y, cols)]);
            }
          }

        }

        return children;
      }

      function calculateNewPanel(originPanel, destinationPanel, selectedSide, cols, panels){

        var newPanel = new TempPanel();
        var panel = originPanel.referTo ? originPanel.referTo : originPanel;

        newPanel.corners = new Corners();

        var orgPos = originPanel.position;
        var desPos = destinationPanel.position;

        if(panel.corners !== null) {
          newPanel.corners.topLeft = panel.corners.topLeft;
          newPanel.corners.topRight = panel.corners.topRight;
          newPanel.corners.bottomLeft = panel.corners.bottomLeft;
          newPanel.corners.bottomRight = panel.corners.bottomRight;
        }else{
          newPanel.corners.topLeft = panel;
          newPanel.corners.topRight = panel;
          newPanel.corners.bottomLeft = panel;
          newPanel.corners.bottomRight = panel;
        }

        if(selectedSide === PanelSide.TopLeft){

          orgPos = newPanel.corners.topLeft.position;

          if(desPos.y > orgPos.y || desPos.x > orgPos.x){

            if(destinationPanel === panel.corners.bottomRight){

              newPanel.id = destinationPanel.id;
              newPanel.position = destinationPanel.position;
              newPanel.corners = null;

            }else{

              if(desPos.x > orgPos.x){
                newPanel.corners.topLeft = panels[newPanel.corners.topLeft.id + 1];
                newPanel.corners.bottomLeft = panels[newPanel.corners.bottomLeft.id + 1];
              }

              if(desPos.y > orgPos.y){
                newPanel.corners.topLeft = panels[newPanel.corners.topLeft.id + cols];
                newPanel.corners.topRight = panels[newPanel.corners.topRight.id + cols];
              }

            }

          }else{

            if(desPos.x < orgPos.x){
              newPanel.corners.topLeft = panels[newPanel.corners.topLeft.id - 1];
              newPanel.corners.bottomLeft = panels[newPanel.corners.bottomLeft.id - 1];
            }

            if(desPos.y < orgPos.y){
              newPanel.corners.topLeft = panels[newPanel.corners.topLeft.id - cols];
              newPanel.corners.topRight = panels[newPanel.corners.topRight.id - cols];
            }

          }

        }else if(selectedSide === PanelSide.TopRight){

          orgPos = newPanel.corners.topRight.position;

          if(desPos.y > orgPos.y || desPos.x < orgPos.x){

            if(destinationPanel === panel.corners.bottomLeft){

              newPanel.id = destinationPanel.id;
              newPanel.position = destinationPanel.position;
              newPanel.corners = null;

            }else{

              if(desPos.x < orgPos.x){
                newPanel.corners.topRight = panels[newPanel.corners.topRight.id - 1];
                newPanel.corners.bottomRight = panels[newPanel.corners.bottomRight.id - 1];
              }

              if(desPos.y > orgPos.y){
                newPanel.corners.topLeft = panels[newPanel.corners.topLeft.id + cols];
                newPanel.corners.topRight = panels[newPanel.corners.topRight.id + cols];
              }

            }

          }else{

            if(desPos.x > orgPos.x){
              newPanel.corners.topRight = panels[newPanel.corners.topRight.id + 1];
              newPanel.corners.bottomRight = panels[newPanel.corners.bottomRight.id + 1];
            }

            if(desPos.y < orgPos.y){
              newPanel.corners.topLeft = panels[newPanel.corners.topLeft.id - cols];
              newPanel.corners.topRight = panels[newPanel.corners.topRight.id - cols];
            }

          }

        }else if(selectedSide === PanelSide.BottomLeft){

          orgPos = newPanel.corners.bottomLeft.position;

          if(desPos.y < orgPos.y || desPos.x > orgPos.x){

            if(destinationPanel === panel.corners.topRight){

              newPanel.id = destinationPanel.id;
              newPanel.position = destinationPanel.position;
              newPanel.corners = null;

            }else{

              if(desPos.x > orgPos.x){
                newPanel.corners.topLeft = panels[newPanel.corners.topLeft.id + 1];
                newPanel.corners.bottomLeft = panels[newPanel.corners.bottomLeft.id + 1];
              }

              if(desPos.y < orgPos.y){
                newPanel.corners.bottomLeft = panels[newPanel.corners.bottomLeft.id - cols];
                newPanel.corners.bottomRight = panels[newPanel.corners.bottomRight.id - cols];
              }

            }

          }else{

            if(desPos.x < orgPos.x){
              newPanel.corners.topLeft = panels[newPanel.corners.topLeft.id - 1];
              newPanel.corners.bottomLeft = panels[newPanel.corners.bottomLeft.id - 1];
            }

            if(desPos.y > orgPos.y){
              newPanel.corners.bottomLeft = panels[newPanel.corners.bottomLeft.id + cols];
              newPanel.corners.bottomRight = panels[newPanel.corners.bottomRight.id + cols];
            }

          }

        }else if(selectedSide === PanelSide.BottomRight){

          orgPos = newPanel.corners.bottomRight.position;

          if(desPos.y < orgPos.y || desPos.x < orgPos.x){

            if(destinationPanel === panel.corners.topLeft){

              newPanel.id = destinationPanel.id;
              newPanel.position = destinationPanel.position;
              newPanel.corners = null;

            }else{

              if(desPos.x < orgPos.x){
                newPanel.corners.topRight = panels[newPanel.corners.topRight.id - 1];
                newPanel.corners.bottomRight = panels[newPanel.corners.bottomRight.id - 1];
              }

              if(desPos.y < orgPos.y){
                newPanel.corners.bottomLeft = panels[newPanel.corners.bottomLeft.id - cols];
                newPanel.corners.bottomRight = panels[newPanel.corners.bottomRight.id - cols];
              }

            }

          }else{

            if(desPos.x > orgPos.x){
              newPanel.corners.topRight = panels[newPanel.corners.topRight.id + 1];
              newPanel.corners.bottomRight = panels[newPanel.corners.bottomRight.id + 1];
            }

            if(desPos.y > orgPos.y){
              newPanel.corners.bottomLeft = panels[newPanel.corners.bottomLeft.id + cols];
              newPanel.corners.bottomRight = panels[newPanel.corners.bottomRight.id + cols];
            }

          }

        }else if(selectedSide === PanelSide.Top){

          orgPos = newPanel.corners.topLeft.position;

          if(desPos.y > orgPos.y){

            if(panel.corners.bottomLeft === panel.corners.bottomRight && destinationPanel === panel.corners.bottomLeft){

              newPanel.id = destinationPanel.id;
              newPanel.position = destinationPanel.position;
              newPanel.corners = null;

            }else{

              newPanel.corners.topLeft = panels[newPanel.corners.topLeft.id + cols];
              newPanel.corners.topRight = panels[newPanel.corners.topRight.id + cols];

            }

          }else if(desPos.y < orgPos.y){

            newPanel.corners.topLeft = panels[newPanel.corners.topLeft.id - cols];
            newPanel.corners.topRight = panels[newPanel.corners.topRight.id - cols];

          }

        }else if(selectedSide === PanelSide.Bottom){

          orgPos = newPanel.corners.bottomLeft.position;

          if(desPos.y < orgPos.y){

            if(panel.corners.topLeft === panel.corners.topRight && destinationPanel === panel.corners.topLeft){

              newPanel.id = destinationPanel.id;
              newPanel.position = destinationPanel.position;
              newPanel.corners = null;

            }else{

              newPanel.corners.bottomLeft = panels[newPanel.corners.bottomLeft.id - cols];
              newPanel.corners.bottomRight = panels[newPanel.corners.bottomRight.id - cols];

            }

          }else if(desPos.y > orgPos.y){

            newPanel.corners.bottomLeft = panels[newPanel.corners.bottomLeft.id + cols];
            newPanel.corners.bottomRight = panels[newPanel.corners.bottomRight.id + cols];

          }

        }else if(selectedSide === PanelSide.Left){

          orgPos = newPanel.corners.topLeft.position;

          if(desPos.x > orgPos.x){

            if(panel.corners.topRight === panel.corners.bottomRight && destinationPanel === panel.corners.topRight){

              newPanel.id = destinationPanel.id;
              newPanel.position = destinationPanel.position;
              newPanel.corners = null;

            }else{

              newPanel.corners.topLeft = panels[newPanel.corners.topLeft.id + 1];
              newPanel.corners.bottomLeft = panels[newPanel.corners.bottomLeft.id + 1];

            }

          }else if(desPos.x < orgPos.x){

            newPanel.corners.topLeft = panels[newPanel.corners.topLeft.id - 1];
            newPanel.corners.bottomLeft = panels[newPanel.corners.bottomLeft.id - 1];

          }

        }else if(selectedSide === PanelSide.Right){

          orgPos = newPanel.corners.topRight.position;

          if(desPos.x < orgPos.x){

            if(panel.corners.topLeft === panel.corners.bottomLeft && destinationPanel === panel.corners.topLeft){

              newPanel.id = destinationPanel.id;
              newPanel.position = destinationPanel.position;
              newPanel.corners = null;

            }else{

              newPanel.corners.topRight = panels[newPanel.corners.topRight.id - 1];
              newPanel.corners.bottomRight = panels[newPanel.corners.bottomRight.id - 1];

            }

          }else if(desPos.x > orgPos.x){

            newPanel.corners.topRight = panels[newPanel.corners.topRight.id + 1];
            newPanel.corners.bottomRight = panels[newPanel.corners.bottomRight.id + 1];

          }

        }

        if(newPanel.corners !== null){
          newPanel.id = newPanel.corners.topLeft.id;
          newPanel.position = newPanel.corners.topLeft.position;
          newPanel.children = getPanelChildren(newPanel, cols, panels);
          newPanel.container = new Container(null,
            newPanel.corners.topRight.position.x - newPanel.corners.topLeft.position.x + 1,
            newPanel.corners.bottomLeft.position.y - newPanel.corners.topLeft.position.y + 1
          );
        }else{
          newPanel.container = new Container(null, 1, 1);
        }

        return newPanel;
      }

      function fillOptionalPanels(optionalPanels, panelsOverlays){
        for(var i = 0; i < optionalPanels.length; i++){

          var index = optionalPanels[i].id;
          panelsOverlays[index].cover = angular.element('<div class="optional"></div>');
          panelsOverlays[index].element.append(panelsOverlays[index].cover);
        }
      }

      function truncateOptionalPanels(optionalPanels, panelsOverlays) {
        while (optionalPanels.length) {
          var currentPanel = optionalPanels.pop();

          panelsOverlays[currentPanel.id].cover.remove();
          panelsOverlays[currentPanel.id].cover = null;
        }
      }

      function clearPanelsIconAnimation(panelsOverlays, presetsScope){
        for(var i = 0; i < panelsOverlays.length; i++){
          panelsOverlays[i].iconClasses = null;
        }

        presetsScope.$digest();
      }

      function setMouseCursors(type, panels) {
        for (var i = 0; i < panels.length; i++) {
          panels[i].overlay.css('cursor', type);
          panels[i].container.element.css('cursor', type);
        }
      }

      function calculateOptionalPanels(optionalPanels, tempPanels, selectedSide, cols, rows, panels){

        for(var i = 0; i < tempPanels.length; i++){
          var options = getResizeOptions(tempPanels[i], selectedSide, cols, rows, panels);
          optionalPanels = optionalPanels.concat(calculateOptionalPanels(options.optionalPanels, options.tempPanels, selectedSide, cols, rows, panels));
        }

        return optionalPanels;
      }

      function checkIfLegalPanel(optionalPanels, panel){

        for(var i = 0; i < optionalPanels.length; i++){
          if(optionalPanels[i].id === panel.id){
            return true;
          }
        }

        return false;
      }

      function SizeCalculationData(){
        this.originalContainerWidth = null;
        this.originalContainerHeight = null;
        this.backToOriginalWidth = null;
        this.backToOriginalHeight = null
      }

      function calculateContainerSizeOnMove(container, selectedSide, deltaX, deltaY, originalWidth, originalHeight,
                                            mousePosition, calculationData){

        var width = 0;
        var height = 0;

        var top = 0;
        var left = 0;

        var containerWidth = calculationData.originalContainerWidth + 1;
        var containerHeight = calculationData.originalContainerHeight + 1;

        var currentWidth = container.element.outerWidth();
        var currentHeight = container.element.outerHeight();

        if(selectedSide === PanelSide.TopLeft){

          if(deltaX < 0){
            width = (containerWidth * 100) + (Math.abs(deltaX) * 100 / originalWidth) + '%';

            if(calculationData.backToOriginalWidth){
              left = -(Math.abs(deltaX) * 100 / originalWidth) + 100 * container.width + '%';
            }else{
              left = -(Math.abs(deltaX) * 100 / originalWidth) + '%';
            }
          }else{
            width = (containerWidth * 100) - (Math.abs(deltaX) * 100 / originalWidth) + '%';
            left = (Math.abs(deltaX) * 100 / originalWidth) + '%';

            if(currentWidth <= originalWidth){
              width = '100%';
              left = container.width * 100 + '%';

              if(calculationData.originalContainerWidth > 0){
                mousePosition.x += originalWidth * calculationData.originalContainerWidth;
                calculationData.originalContainerWidth = 0;
                calculationData.backToOriginalWidth = true;
              }
            }
          }

          if(deltaY < 0){
            height = (containerHeight * 100) + (Math.abs(deltaY) * 100 / originalHeight) + '%';

            if(calculationData.backToOriginalHeight){
              top = -(Math.abs(deltaY) * 100 / originalHeight) + 100 * container.height + '%';
            }else{
              top = -(Math.abs(deltaY) * 100 / originalHeight) + '%';
            }
          }else{
            height = (containerHeight * 100) - (Math.abs(deltaY) * 100 / originalHeight) + '%';
            top = (Math.abs(deltaY) * 100 / originalHeight) + '%';

            if(currentHeight <= originalHeight){
              height = '100%';
              top = container.height * 100 + '%';

              if(calculationData.originalContainerHeight > 0){
                mousePosition.y += originalHeight * calculationData.originalContainerHeight;
                calculationData.originalContainerHeight = 0;
                calculationData.backToOriginalHeight = true;
              }
            }
          }

          container.element.css({
            top: top,
            left: left,
            width: width,
            height: height
          });

        }else if(selectedSide === PanelSide.TopRight){

          if(deltaX > 0){
            width = (containerWidth * 100) + (Math.abs(deltaX) * 100 / originalWidth) + '%';
          }else{
            width = (containerWidth * 100) - (Math.abs(deltaX) * 100 / originalWidth) + '%';

            if(currentWidth <= originalWidth){
              width = '100%';

              if(calculationData.originalContainerWidth > 0){
                mousePosition.x -= originalWidth * calculationData.originalContainerWidth;
                calculationData.originalContainerWidth = 0;
              }
            }
          }

          if(deltaY < 0){
            height = (containerHeight * 100) + (Math.abs(deltaY) * 100 / originalHeight) + '%';

            if(calculationData.backToOriginalHeight){
              top = -(Math.abs(deltaY) * 100 / originalHeight) + 100 * container.height + '%';
            }else{
              top = -(Math.abs(deltaY) * 100 / originalHeight) + '%';
            }
          }else{
            height = (containerHeight * 100) - (Math.abs(deltaY) * 100 / originalHeight) + '%';
            top = (Math.abs(deltaY) * 100 / originalHeight) + '%';

            if(currentHeight <= originalHeight){
              height = '100%';
              top = container.height * 100 + '%';

              if(calculationData.originalContainerHeight > 0){
                mousePosition.y += originalHeight * calculationData.originalContainerHeight;
                calculationData.originalContainerHeight = 0;
                calculationData.backToOriginalHeight = true;
              }
            }
          }

          container.element.css({
            top: top,
            width: width,
            height: height
          });

        }else if(selectedSide === PanelSide.BottomLeft){

          if(deltaX < 0){
            width = (containerWidth * 100) + (Math.abs(deltaX) * 100 / originalWidth) + '%';

            if(calculationData.backToOriginalWidth){
              left = -(Math.abs(deltaX) * 100 / originalWidth) + 100 * container.width + '%';
            }else{
              left = -(Math.abs(deltaX) * 100 / originalWidth) + '%';
            }
          }else{
            width = (containerWidth * 100) - (Math.abs(deltaX) * 100 / originalWidth) + '%';
            left = (Math.abs(deltaX) * 100 / originalWidth) + '%';

            if(currentWidth <= originalWidth){
              width = '100%';
              left = container.width * 100 + '%';

              if(calculationData.originalContainerWidth > 0){
                mousePosition.x += originalWidth * calculationData.originalContainerWidth;
                calculationData.originalContainerWidth = 0;
                calculationData.backToOriginalWidth = true;
              }
            }
          }

          if(deltaY > 0){
            height = (containerHeight * 100) + (Math.abs(deltaY) * 100 / originalHeight) + '%';
          }else{
            height = (containerHeight * 100) - (Math.abs(deltaY) * 100 / originalHeight) + '%';

            if(currentHeight <= originalHeight){
              height = '100%';

              if(calculationData.originalContainerHeight > 0){
                mousePosition.y -= originalHeight * container.height;
                calculationData.originalContainerHeight = 0;
              }
            }
          }

          container.element.css({
            left: left,
            width: width,
            height: height
          });

        }else if(selectedSide === PanelSide.BottomRight){

          if(deltaX > 0){
            width = (containerWidth * 100) + (Math.abs(deltaX) * 100 / originalWidth) + '%';
          }else{
            width = (containerWidth * 100) - (Math.abs(deltaX) * 100 / originalWidth) + '%';

            if(currentWidth <= originalWidth){
              width = '100%';

              if(calculationData.originalContainerWidth > 0){
                mousePosition.x -= originalWidth * calculationData.originalContainerWidth;
                calculationData.originalContainerWidth = 0;
              }
            }
          }

          if(deltaY > 0){
            height = (containerHeight * 100) + (Math.abs(deltaY) * 100 / originalHeight) + '%';
          }else{
            height = (containerHeight * 100) - (Math.abs(deltaY) * 100 / originalHeight) + '%';

            if(currentHeight <= originalHeight){
              height = '100%';

              if(calculationData.originalContainerHeight > 0){
                mousePosition.y -= originalHeight * container.height;
                calculationData.originalContainerHeight = 0;
              }
            }
          }

          container.element.css({
            width: width,
            height: height
          });

        }else if(selectedSide === PanelSide.Top){

          if(deltaY < 0){
            height = (containerHeight * 100) + (Math.abs(deltaY) * 100 / originalHeight) + '%';

            if(calculationData.backToOriginalHeight){
              top = -(Math.abs(deltaY) * 100 / originalHeight) + 100 * container.height + '%';
            }else{
              top = -(Math.abs(deltaY) * 100 / originalHeight) + '%';
            }
          }else{
            height = (containerHeight * 100) - (Math.abs(deltaY) * 100 / originalHeight) + '%';
            top = (Math.abs(deltaY) * 100 / originalHeight) + '%';

            if(currentHeight <= originalHeight){
              height = '100%';
              top = container.height * 100 + '%';

              if(calculationData.originalContainerHeight > 0){
                mousePosition.y += originalHeight * calculationData.originalContainerHeight;
                calculationData.originalContainerHeight = 0;
                calculationData.backToOriginalHeight = true;
              }
            }
          }

          container.element.css({
            top: top,
            height: height
          });

        }else if(selectedSide === PanelSide.Bottom){

          if(deltaY > 0){
            height = (containerHeight * 100) + (Math.abs(deltaY) * 100 / originalHeight) + '%';
          }else{
            height = (containerHeight * 100) - (Math.abs(deltaY) * 100 / originalHeight) + '%';

            if(currentHeight <= originalHeight){
              height = '100%';

              if(calculationData.originalContainerHeight > 0){
                mousePosition.y -= originalHeight * container.height;
                calculationData.originalContainerHeight = 0;
              }
            }
          }

          container.element.css({
            height: height
          });

        }else if(selectedSide === PanelSide.Left){

          if(deltaX < 0){
            width = (containerWidth * 100) + (Math.abs(deltaX) * 100 / originalWidth) + '%';

            if(calculationData.backToOriginalWidth){
              left = -(Math.abs(deltaX) * 100 / originalWidth) + 100 * container.width + '%';
            }else{
              left = -(Math.abs(deltaX) * 100 / originalWidth) + '%';
            }
          }else{
            width = (containerWidth * 100) - (Math.abs(deltaX) * 100 / originalWidth) + '%';
            left = (Math.abs(deltaX) * 100 / originalWidth) + '%';

            if(currentWidth <= originalWidth){
              width = '100%';
              left = container.width * 100 + '%';

              if(calculationData.originalContainerWidth > 0){
                mousePosition.x += originalWidth * calculationData.originalContainerWidth;
                calculationData.originalContainerWidth = 0;
                calculationData.backToOriginalWidth = true;
              }
            }
          }

          container.element.css({
            width: width,
            left: left
          });

        }else if(selectedSide === PanelSide.Right){

          if(deltaX > 0){
            width = (containerWidth * 100) + (Math.abs(deltaX) * 100 / originalWidth) + '%';
          }else{
            width = (containerWidth * 100) - (Math.abs(deltaX) * 100 / originalWidth) + '%';

            if(currentWidth <= originalWidth ){
              width = '100%';

              if(calculationData.originalContainerWidth > 0){
                mousePosition.x -= originalWidth * calculationData.originalContainerWidth;
                calculationData.originalContainerWidth = 0;
              }
            }
          }

          container.element.css({
            width: width
          });

        }

      }

      function calculatePanelByTile(tile, rows, cols, panels){
        var newPanel = new TempPanel();
        newPanel.id = tile.position - 1;
        var y = Math.ceil(tile.position / rows);
        var x = tile.position - (y - 1) * cols;
        newPanel.position = new Position(x - 1, y - 1);
        newPanel.corners = null;
        newPanel.children = [];

        if(tile.size.width > 1 || tile.size.height > 1){

          newPanel.corners = new Corners();
          var mainPosition = tile.position;

          for(y = 0; y < tile.size.height; y++){
            for(x = 0; x < tile.size.width; x++){
              var realPosition = mainPosition - 1;
              if(y === 0 && x === 0){
                newPanel.corners.topLeft = panels[realPosition];
              }
              if(y === 0 && x + 1 === tile.size.width){
                newPanel.corners.topRight = panels[realPosition];
              }
              if(y + 1 === tile.size.height && x === 0){
                newPanel.corners.bottomLeft = panels[realPosition];
              }
              if(y + 1 === tile.size.height && x + 1 === tile.size.width){
                newPanel.corners.bottomRight = panels[realPosition];
              }
              newPanel.children.push(panels[realPosition]);
              mainPosition++;
            }
            mainPosition += (cols - (tile.size.width - 1) - 1);
          }

        }

        if(newPanel.corners !== null){
          newPanel.container = new Container(null,
            newPanel.corners.topRight.position.x - newPanel.corners.topLeft.position.x + 1,
            newPanel.corners.bottomLeft.position.y - newPanel.corners.topLeft.position.y + 1
          );
        }else{
          newPanel.container = new Container(null, 1, 1);
        }

        return newPanel;
      }

      function applyNewTile(tile, rows, cols, panels){

        var newPanel = calculatePanelByTile(tile, rows, cols, panels);

        var realPanel = panels[newPanel.id];

        if(newPanel.corners !== null) {
          realPanel.corners = newPanel.corners;

          realPanel.children = newPanel.children;
          for (var i = 0; i < realPanel.children.length; i++) {
            realPanel.children[i].inUse = true;
            if(i > 0){
              realPanel.children[i].referTo = realPanel;
            }
          }
        }else{
          realPanel.inUse = true;
          realPanel.corners = null;
          realPanel.children = [];
        }

        realPanel.overlay.css('z-index', '3');
        realPanel.container.width = newPanel.container.width - 1;
        realPanel.container.height = newPanel.container.height - 1;

        realPanel.container.element.css({
          width: newPanel.container.width * 100 + '%',
          height: newPanel.container.height * 100 + '%'
        });

        realPanel.content.css('background-color', '#ffffff');

        return realPanel;
      }

      function resetPanel(panel){
        var resetContainerSize = function(){
          panel.container.element.css({
            width: '100%',
            height: '100%'
          });
        };

        if(panel.overlay.hasClass('productBox')){
          $animate.removeClass(panel.overlay, 'productBox').then(resetContainerSize);
        }else{
          panel.overlay.removeClass('productBox');
          resetContainerSize();
        }

        panel.overlay.css('z-index', '2');

        panel.container.width = 0;
        panel.container.height = 0;

        panel.content.css('background-color', '');

        panel.corners = null;

        if(panel.children.length !== 0){
          while(panel.children.length !== 0){
            var child = panel.children.pop();
            child.inUse = false;
            child.referTo = null;
          }
        }

        panel.enableUpdate = false;
        panel.referTo = null;
        panel.inUse = false;
      }

      function changePanelSizeAndPosition(presetsScope, newPanel, originPanel, tiles, panels){

        var realPanel = panels[newPanel.id];

        resetPanel(originPanel);

        if(realPanel.id !== originPanel.id){
          var tempTile = tiles[originPanel.id];
          tiles[originPanel.id] = null;
          tempTile.position = realPanel.id + 1;
          tiles[realPanel.id] = tempTile;
          presetsScope.$digest();
        }

        tiles[realPanel.id].size.width = newPanel.container.width;
        tiles[realPanel.id].size.height = newPanel.container.height;

        if(newPanel.corners !== null) {
          realPanel.corners = newPanel.corners;

          realPanel.children = newPanel.children;
          for (var i = 0; i < realPanel.children.length; i++) {
            realPanel.children[i].inUse = true;
            if(i > 0){
              realPanel.children[i].referTo = realPanel;
            }
          }
        }else{
          realPanel.inUse = true;
          realPanel.corners = null;
          realPanel.children = [];
        }

        realPanel.overlay.css('z-index', '3');
        realPanel.container.width = newPanel.container.width - 1;
        realPanel.container.height = newPanel.container.height - 1;

        realPanel.container.element.css({
          width: newPanel.container.width * 100 + '%',
          height: newPanel.container.height * 100 + '%'
        });

        realPanel.content.css('background-color', '#ffffff');

        return realPanel;
      }

      function EventData(panel, common){
        this.panel = panel;
        this.common = common;
      }

      function onMouseHold(event){
        if(event.data.common.extendCanceled && event.type === "mousedown" && event.data.panel.inUse){

          event.data.common.isMouseHold = true;

          if(event.data.common.holdTimeOut === null){

            event.data.common.holdTimeOut = setTimeout(function(){

              if(event.data.common.isMouseHold === true){
                event.data.panel.cancelEdit();

                event.data.common.realPanel.overlay.css('z-index', '3');

                event.data.common.workspaceData.enterDragDropMode(true);
              }

            }, 2000);
          }
        }
        if(event.type === "mouseup" && event.data.panel.inUse){

          event.data.common.isMouseHold = false;

          if(event.data.common.holdTimeOut !== null){

            clearTimeout(event.data.common.holdTimeOut);
            event.data.common.holdTimeOut = null;
          }
        }
      }

      function onMouseDown(event) {
        event.stopPropagation();
        event.preventDefault();

        event.data.common.realPanel = event.data.panel.referTo ? event.data.panel.referTo : event.data.panel;

        if(!event.data.panel.inUse){
          event.data.common.workspaceData.enterAddMode(event.data.common.realPanel.id + 1);
          return;
        }

        event.data.common.extendStart = true;
        event.data.common.originId = event.data.panel.id;
        event.data.common.container = event.data.common.realPanel.container;
        setMouseCursors(event.data.common.container.cursor.type, event.data.common.panels);

        if(event.data.common.container.cursor.side === PanelSide.Middle){
          event.data.common.extendCanceled = true;
        }

        event.data.common.mousePosition = new Position(event.pageX, event.pageY);

        event.data.common.startWidth = event.data.common.container.width;
        event.data.common.startHeight = event.data.common.container.height;

        event.data.common.originalWidth = event.data.panel.overlay.width();
        event.data.common.originalHeight = event.data.panel.overlay.height();

        event.data.common.calculationData = new SizeCalculationData();

        event.data.common.calculationData.originalContainerWidth = event.data.common.container.width;
        event.data.common.calculationData.originalContainerHeight = event.data.common.container.height;

        event.data.common.calculationData.backToOriginalWidth = false;
        event.data.common.calculationData.backToOriginalHeight = false;

        event.data.common.selectedSide = event.data.common.container.cursor.side;
        event.data.common.realPanel.overlay.css('z-index', '4');

        event.data.common.container.cover = angular.element('<div class="selector"></div>');
        event.data.common.container.element.append(event.data.common.container.cover);

        var resizeOptions = getResizeOptions(
          event.data.common.selectedCorner, event.data.common.selectedSide, event.data.common.cols, event.data.common.rows, event.data.common.panels
        );

        event.data.common.optionalPanels = calculateOptionalPanels(
          resizeOptions.optionalPanels, resizeOptions.tempPanels, event.data.common.selectedSide,
          event.data.common.cols, event.data.common.rows, event.data.common.panels
        );

        fillOptionalPanels(event.data.common.optionalPanels, event.data.common.panelsOverlays);

        event.data.common.newPanel = event.data.panel.referTo ? event.data.panel.referTo : event.data.panel;
        event.data.common.currentPanel = event.data.panel;
      }

      function onMouseUp(event) {
        if(event.data.common.extendStart) {

          event.data.common.extendStart = false;

          if (event.data.common.errorPanel !== null) {
            event.data.common.errorContainer.cover.remove();
            event.data.common.errorContainer.cover = null;
            event.data.common.errorContainer = null;
          }

          truncateOptionalPanels(event.data.common.optionalPanels, event.data.common.panelsOverlays);
          setMouseCursors('initial', event.data.common.panels);

          event.data.common.container.cover.remove();
          event.data.common.container.cover = null;

          event.data.common.container.element.css({
            top: '0%',
            left: '0%',
            width: (event.data.common.startWidth + 1) * 100 + '%',
            height: (event.data.common.startHeight + 1) * 100 + '%'
          });

          event.data.common.realPanel.overlay.css('z-index', '3');

          if(!event.data.common.extendCanceled) {
            if (event.data.panel !== event.data.common.panels[event.data.common.originId] && event.data.panel !== event.data.common.errorPanel) {
              var panel = changePanelSizeAndPosition(event.data.common.presetsScope, event.data.common.newPanel, event.data.common.realPanel, event.data.common.tiles, event.data.common.panels);
              var resizeInfo = { position: panel.id + 1, size: { width: panel.container.width + 1, height: panel.container.height + 1 }};
              event.data.common.onPanelSizeChanged(event.data.common.tiles[panel.id], resizeInfo);
            }
          }else{
            event.data.common.extendCanceled = false;
          }

          event.data.common.errorPanel = null;
          event.data.common.mousePosition = null;
          event.data.common.calculationData = null;
          event.data.common.extendCancelded = false;
        }
      }

      function onMouseEnter(event) {
        event.stopPropagation();

        event.data.common.nowOnPanel = event.data.panel;

        if (!event.data.common.extendStart) {

          event.data.common.selectedCorner = event.data.panel;

          clearPanelsIconAnimation(event.data.common.panelsOverlays, event.data.common.presetsScope);

          if(!event.data.panel.inUse){
            event.data.common.panelsOverlays[event.data.panel.id].iconClasses = 'preset-pic-hover';
            event.data.common.presetsScope.$digest();
          }

        } else {

          if(event.data.common.errorPanel !== null){
            event.data.common.errorContainer.cover.remove();
            event.data.common.errorContainer.cover = null;
            event.data.common.errorPanel = null;
            event.data.common.errorContainer = null;
          }

          if(event.data.common.panels[event.data.common.originId] !== event.data.panel && !checkIfLegalPanel(event.data.common.optionalPanels, event.data.panel)){
            event.data.common.errorPanel = event.data.panel;
            event.data.common.errorContainer = event.data.common.errorPanel.referTo ? event.data.common.errorPanel.referTo.container : event.data.common.errorPanel.container;
            event.data.common.errorContainer.cover = angular.element('<div class="error"></div>');
            event.data.common.errorContainer.element.append(event.data.common.errorContainer.cover);
            return;
          }

          event.data.common.newPanel = calculateNewPanel(
            event.data.common.newPanel, event.data.panel, event.data.common.selectedSide, event.data.common.cols, event.data.common.panels
          );
        }
      }

      function onMouseLeave(event){
        if(event.data.panel.inUse){
          var panel = event.data.panel.referTo ? event.data.panel.referTo : event.data.panel;
          panel.overlay.removeClass('preset-tile-hover-animation');
        }
      }

      function onMouseMove(event) {
        event.stopPropagation();

        if (event.data.common.extendStart) {

          var deltaX = event.pageX - event.data.common.mousePosition.x;
          var deltaY = event.pageY - event.data.common.mousePosition.y;

          event.data.common.container = event.data.common.realPanel.container;

          calculateContainerSizeOnMove(
            event.data.common.container, event.data.common.selectedSide, deltaX, deltaY, event.data.common.originalWidth,
            event.data.common.originalHeight, event.data.common.mousePosition, event.data.common.calculationData
          );

        }else{
          if(event.data.panel.inUse){
            var container = event.data.panel.referTo ? event.data.panel.referTo.container : event.data.panel.container;
            var offset = container.element.offset();

            var clientX = event.pageX - (offset.left);
            var clientY = event.pageY - (offset.top);

            var hitArea = getHitArea(container.element.outerWidth(), container.element.outerHeight(), clientX, clientY);
            var cursorType = getCursorType(hitArea);

            event.data.panel.overlay.css('cursor', cursorType);
            container.element.css('cursor', cursorType);
            container.cursor = new Cursor(hitArea, cursorType);
          }
        }
      }

      function reset(){
        this.overlay.css('z-index', '2');
        this.overlay.removeClass('productBox');

        this.container.width = 0;
        this.container.height = 0;

        this.container.element.css({
          width: '100%',
          height: '100%'
        });

        this.content.css('background-color', '');

        this.corners = null;

        if(this.children.length !== 0){
          while(this.children.length !== 0){
            var child = this.children.pop();
            child.inUse = false;
            child.referTo = null;
          }
        }
      }

      function startEdit(){
        this.container.element.css('pointer-events', 'none');
        this.overlay.mousedown(this.eventsData, onMouseDown);
        this.overlay.mouseup(this.eventsData, onMouseUp);
        this.overlay.mouseenter(this.eventsData, onMouseEnter);
        this.overlay.mousemove(this.eventsData, onMouseMove);
        this.overlay.mouseleave(this.eventsData, onMouseLeave);
        this.overlay.on('mousedown mouseup', this.eventsData, onMouseHold);
        this.inEdit = true;
      }

      function stopEdit(){
        this.container.element.css({
          'cursor': 'initial',
          'pointer-events': ''
        });
        this.overlay.unbind('mousedown');
        this.overlay.unbind('mouseup');
        this.overlay.unbind('mouseenter');
        this.overlay.unbind('mousemove');
        this.overlay.unbind('mousedown mouseup');
        this.inEdit = false;
      }

      function cancelEdit(){
        if(this.inEdit){
          this.overlay.trigger('mouseup', this.eventsData);
        }
      }

      function CommonData(){
        this.rows = 0;
        this.cols = 0;
        this.tiles = [];
        this.panels = [];
        this.panelsOverlays = [];
        this.extendStart = false;
        this.extendCanceled = false;
        this.realPanel = null;
        this.mousePosition = null;
        this.originId = 0;
        this.startWidth = 0;
        this.startHeight = 0;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.calculationData = null;
        this.selectedCorner = null;
        this.selectedSide = null;
        this.container = null;
        this.newPanel = null;
        this.errorPanel = null;
        this.errorContainer = null;
        this.currentPanel = null;
        this.nowOnPanel = null;
        this.optionalPanels = [];
        this.presetsScope = null;
        this.workspaceData = null;
        this.isMouseHold = false;
        this.holdTimeOut = null;
        this.onPanelSizeChanged = function(){};
      }

      function Panel(overlay, container, content, commonData){
        this.id = null;
        this.position = null;
        this.overlay = overlay;
        this.container = new Container(container, 0, 0);
        this.content = content;
        this.inUse = false;
        this.referTo = null;
        this.children = [];
        this.corners = null;
        this.eventsData = new EventData(this, commonData);
        this.inEdit = false;
        this.enableUpdate = false;
      }

      Panel.prototype.reset = reset;
      Panel.prototype.startEdit = startEdit;
      Panel.prototype.stopEdit = stopEdit;
      Panel.prototype.cancelEdit = cancelEdit;

      function PanelOverlay(element, icon){
        this.id = 0;
        this.element = element;
        this.cover = null;
        this.classes = null;
        this.icon = icon;
        this.iconClasses = null;
      }

      return {
        restrict: 'EA',
        replace: true,
        require: '^preset',
        scope:{
          workspaceData: '=workspace'
        },
        link: function (scope, element, attrs, controller) {

          var workspacesIds = {};
          var enableWorkspaceChangedAnimation = false;
          var mainWorkspaceContainer = $compile('<div class="presets-container preset-workspace-changed-animation"></div>')(scope);
          element.append(mainWorkspaceContainer);

          var presetsScope = null;
          var presetContainer = null;

          var addUpdateContainer = null;
          var addContainer = null;
          var addElement = null;
          var updateContainer = null;
          var updateElement = null;

          var workspaceContainer = null;
          var workspacePanelsOverlay = null;
          var workspacePanelsContainer = null;

          var addScope = null;
          var updateScope = null;
          var commonData = null;

          function createPanel(position, commonData) {

            var overlay = angular.element('<div class="presets-workspace-panel"></div>');
            var container = angular.element('<div class="resize"></div>');
            var content = angular.element('<div class="content"></div>');
            var editContent = angular.element(
              '<div ng-if="panels[' + position + '].enableUpdate" class="presets-edit-content-container">' +
                '<div class="presets-edit-content">' +
                  '<div class="presets-edit-content-container"><div class="overlay"></div></div>' +
                  '<div class="options">' +
                      '<div class="btn-area">' +
                        '<button type="button" class="btn btn-default btn-responsive" ng-click="removeTile(' + (position + 1) + ')">' +
                          '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' +
                        '</button>' +
                      '</div>' +
                      '<div class="btn-area">' +
                        '<button type="button" class="btn btn-default btn-responsive" ng-click="updateTile(' + (position + 1) + ')">' +
                          '<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>' +
                        '</button>' +
                      '</div>' +
                  '</div>' +
                '</div>' +
              '</div>'
            );

            content.append(editContent);
            content.append('<div tile="tiles[' + position + ']"></div>');

            container.append(content);
            overlay.append(container);

            return new Panel(overlay, container, content, commonData);
          }

          function createPanelOverlay(position) {

            var overlay = angular.element(
              '<div class="panel-overlay">' +
                '<div class="content" ng-class="panelsOverlays[' + position + '].classes">' +
                  '<div ng-class="panelsOverlays[' + position + '].iconClasses" class="icon preset-pic">' +
                    '<img class="img-icon" ng-src="{{panelsOverlays[' + position + '].icon}}" />' +
                  '</div>' +
                '</div>' +
              '</div>'
            );

            var iconSrc = Preset.templatesDir + 'images/plus-icon.png';

            return new PanelOverlay(overlay, iconSrc);
          }

          function calculateLocationsAndSizes() {

            var sizeWidth = 100 / commonData.cols;
            var sizeHeight = 100 / commonData.rows;

            var index = 0;

            for (var i = 0; i < commonData.rows; i++) {
              for (var j = 0; j < commonData.cols; j++) {

                var top = sizeHeight * i + '%';
                var left = sizeWidth * j + '%';

                var width = sizeWidth + '%';
                var height = sizeHeight + '%';

                commonData.panelsOverlays[index].element.css('top', top);
                commonData.panelsOverlays[index].element.css('left', left);

                commonData.panelsOverlays[index].element.css('width', width);
                commonData.panelsOverlays[index].element.css('height', height);

                commonData.panels[index].overlay.css('top', top);
                commonData.panels[index].overlay.css('left', left);

                commonData.panels[index].overlay.css('width', width);
                commonData.panels[index].overlay.css('height', height);

                index++;
              }
            }
          }

          function clearAddEditScopesAndElements(){
            if(presetsScope !== null){
              presetsScope.isAddTileMode = false;
              presetsScope.isUpdateTileMode = false;
            }

            if(addScope !== null){
              addScope.$destroy();
              addScope = null;
            }
            if(updateScope !== null){
              updateScope.$destroy();
              updateScope = null;
            }
          }

          function clear(){

            if(presetContainer !== null){

              if(presetsScope !== null){
                presetsScope.$destroy();
                presetsScope = null;
              }

              presetContainer.remove();
              presetContainer = null;

              addUpdateContainer = null;
              addContainer = null;
              updateContainer = null;

              workspaceContainer = null;
              workspacePanelsOverlay = null;
              workspacePanelsContainer = null;

              clearAddEditScopesAndElements();
              commonData = null;
            }
          }

          function init(workspaceData){

            clear();

            presetsScope = scope.$new();

            commonData = new CommonData();

            presetsScope.isAddTileMode = false;
            presetsScope.isUpdateTileMode = false;
            presetsScope.isAddUpdateTileMode = false;
            presetsScope.isDragDropMode = false;

            presetsScope.isEditMode = false;
            presetsScope.firstLoad = true;

            presetsScope.workspaceData = workspaceData;
            presetsScope.tiles = workspaceData.tiles;
            presetsScope.panels = workspaceData.panels;
            presetsScope.panelsOverlays = [];

            commonData.presetsScope = presetsScope;
            commonData.workspaceData = workspaceData;
            commonData.rows = workspaceData.rows;
            commonData.cols = workspaceData.cols;
            commonData.tiles = workspaceData.tiles;
            commonData.panels = workspaceData.panels;
            commonData.panelsOverlays = presetsScope.panelsOverlays;
            commonData.extendStart = false;
            commonData.realPanel = null;
            commonData.mousePosition = null;
            commonData.originId = 0;
            commonData.startWidth = 0;
            commonData.startHeight = 0;
            commonData.originalWidth = 0;
            commonData.originalHeight = 0;
            commonData.calculationData = null;
            commonData.selectedCorner = null;
            commonData.selectedSide = null;
            commonData.container = null;
            commonData.newPanel = null;
            commonData.errorPanel = null;
            commonData.errorContainer = null;
            commonData.currentPanel = null;
            commonData.optionalPanels = [];
            commonData.onPanelSizeChanged = workspaceData.onTileSizeChanged;

            presetContainer = angular.element('<div class="presets-container"></div>');

            addUpdateContainer = angular.element('<div ng-class="{\'presets-add-update-container-animation\' : isAddUpdateTileMode}" ng-show="isAddTileMode || isUpdateTileMode" class="presets-workspace-add-update-container">' +
                                               '<div ng-show="isAddTileMode || isUpdateTileMode" class="overlay presets-add-update-overlay-animation" ng-click="isAddTileMode ? workspaceData.enterEditMode() : workspaceData.enterDragDropMode()"></div></div>');
            addContainer = angular.element('<div ng-class="{\'presets-add-update-animation\': !isUpdateTileMode}" ng-show="isAddTileMode" class="presets-workspace-add-container"></div>');
            updateContainer = angular.element('<div ng-class="{\'presets-add-update-animation\': !isAddTileMode}" ng-show="isUpdateTileMode" class="presets-workspace-update-container"></div>');
            addUpdateContainer.append(addContainer);
            addUpdateContainer.append(updateContainer);

            workspaceContainer = angular.element('<div class="presets-workspace-panels-container"></div>');
            workspacePanelsOverlay = angular.element('<div ng-show="isEditMode" class="presets-workspace-panels-overlay" ng-class="{\'preset-edit-mode-animation\': !firstLoad}"></div>');
            workspacePanelsContainer = angular.element('<div class="presets-panels-container"></div>');
            workspaceContainer.append(workspacePanelsOverlay);
            workspaceContainer.append(workspacePanelsContainer);

            presetContainer.append(workspaceContainer);
            presetContainer.append(addUpdateContainer);

            workspacePanelsContainer.mouseleave(function(){
              clearPanelsIconAnimation(commonData.panelsOverlays, commonData.presetsScope);

              if(commonData.extendStart && commonData.nowOnPanel){
                commonData.extendCanceled = true;
                commonData.nowOnPanel.cancelEdit();
              }
            });

            var panelId = 0;

            for (var i = 0; i < commonData.rows; i++) {
              for (var j = 0; j < commonData.cols; j++) {
                var panelOverlay = createPanelOverlay(panelId);
                workspacePanelsOverlay.append(panelOverlay.element);
                panelOverlay.id = panelId;
                commonData.panelsOverlays.push(panelOverlay);

                var panel = createPanel(panelId, commonData);
                workspacePanelsContainer.append(panel.overlay);
                panel.id = panelId;
                panel.position = new Position(j, i);
                commonData.panels.push(panel);

                panelId++;
              }
            }

            presetContainer = $compile(presetContainer)(presetsScope);

            workspaceData.applyNewTile = applyNewTile;

            workspaceData.resetTile = function(tile){
              resetPanel(workspaceData.panels[tile.position -1]);
            };

            workspaceData.updateTile = function(tile, model){
              tile.model = model;
            };

            presetsScope.removeTile = function(position){
              var preset = workspaceData.preset;
              workspaceData.removeTileByPositionAsync(position, preset.useCache ? false : true).then(
                function resolveSuccess(result){
                }, function resolveError(reason){
                  console.log('cab\'t delete tile right now: ' + reason);
                }
              );
            };

            workspaceData.enterAddMode = function(position){

              clearAddEditScopesAndElements();

              var createAddModeInfo = {
                templateUrl: Preset.templatesDir + 'templates/workspace/add-tile.html',
                controller: 'addTileController'
              };

              var model = {
                position: position,
                workspaceData: workspaceData,
                model: {}
              };

              MVC.create(presetsScope, createAddModeInfo, model, true, true).then(
                function(instance){

                  if(addElement !== null){
                    addElement.remove();
                    addElement = null;
                  }

                  addScope = instance.scope;
                  addElement = instance.element;
                  addContainer.append(addElement);

                  presetsScope.isAddUpdateTileMode = true;
                  presetsScope.isAddTileMode = true;

                }, function(reason){
                  throw new LoadException("Can't load add mode!");
                }
              );
            };

            workspaceData.enterUpdateMode = function(position){

              clearAddEditScopesAndElements();

              var createUpdateModeInfo = {
                templateUrl: Preset.templatesDir + 'templates/workspace/update-tile.html',
                controller: 'updateTileController'
              };

              var model = {
                position: position,
                workspaceData: workspaceData
              };

              MVC.create(presetsScope, createUpdateModeInfo, model, true, true).then(
                function(instance){

                  if(updateElement !== null){
                    updateElement.remove();
                    updateElement = null;
                  }

                  updateScope = instance.scope;
                  updateElement = instance.element;
                  updateContainer.append(updateElement);

                  presetsScope.isAddUpdateTileMode = true;
                  presetsScope.isUpdateTileMode = true;

                }, function(reason){
                  throw new LoadException("Can't load update mode!");
                }
              );
            };

            presetsScope.updateTile = function(position){
              workspaceData.enterUpdateMode(position);
            };

            function enablePanelsEdit(){
              for(var i = 0; i < workspaceData.panels.length; i++){
                workspaceData.panels[i].startEdit();
              }
            }

            function disablePanelsEdit(){
              for(var i = 0; i < workspaceData.panels.length; i++){
                workspaceData.panels[i].stopEdit();
              }
            }

            function enablePanelsUpdate(){
              for(var i = 0; i < workspaceData.panels.length; i++){
                if(workspaceData.panels[i].inUse && workspaceData.panels[i].referTo === null){
                  workspaceData.panels[i].enableUpdate = true;
                  workspaceData.panels[i].overlay.addClass('productBox');
                }
              }
            }

            function disablePanelsUpdate(){
              for(var i = 0; i < workspaceData.panels.length; i++){
                if(workspaceData.panels[i].inUse && workspaceData.panels[i].referTo === null){
                  workspaceData.panels[i].enableUpdate = false;
                  workspaceData.panels[i].overlay.removeClass('productBox');
                }
              }
            }

            workspaceData.enterDragDropMode = function(digest){

              clearAddEditScopesAndElements();
              disablePanelsEdit();
              enablePanelsUpdate();

             if(digest === true){
                presetsScope.$digest();
              }

              presetsScope.isDragDropMode = true;
            };

            workspaceData.exitDragDropMode = function(){

              disablePanelsUpdate();
              enablePanelsEdit();
              presetsScope.isDragDropMode = false;
              commonData.holdTimeOut = null;
            };

            workspaceData.enterPresentationMode = function(){

              disablePanelsEdit();
              disablePanelsUpdate();

              clearAddEditScopesAndElements();
              presetsScope.isEditMode = false;

            };

            workspaceData.enterEditMode = function(){

              disablePanelsEdit();
              enablePanelsEdit();

              clearAddEditScopesAndElements();
              presetsScope.isEditMode = true;

            };

            var triggerCount = 0;

            workspaceData.triggerEditMode = function(){

              if(presetsScope.isDragDropMode){
                workspaceData.exitDragDropMode();
                return;
              }

              if(triggerCount > 0){
                presetsScope.firstLoad = false;
              }
              triggerCount++;

              if(presetsScope.firstLoad && workspaceData.tilesCount === 0){
                workspaceData.enterEditMode();
                return;
              }

              if(presetsScope.firstLoad && workspaceData.tilesCount > 0){
                return;
              }

              if(workspaceData.tilesCount === 0){
                if(presetsScope.isEditMode){
                  return;
                }
                workspaceData.enterEditMode();
                return;
              }

              if(presetsScope.isEditMode){
                workspaceData.enterPresentationMode();
              }else{
                workspaceData.enterEditMode();
              }

            };

            workspaceData.init();
            workspaceData.triggerEditMode();

            mainWorkspaceContainer.append(presetContainer);
            calculateLocationsAndSizes();
            if(enableWorkspaceChangedAnimation){
                $animate.enter(mainWorkspaceContainer, element);
            }
          }

          scope.$watch('workspaceData', function(workspaceData){

            if(!(workspaceData instanceof WorkspaceData)){
              return;
            }

            if(workspacesIds[workspaceData.workspaceId] !== undefined){
              enableWorkspaceChangedAnimation = true;
            }else{
              workspacesIds[workspaceData.workspaceId] = true;
              enableWorkspaceChangedAnimation = false;
            }

            if(enableWorkspaceChangedAnimation){
              $animate.leave(mainWorkspaceContainer).then(function() {
                init(workspaceData);
              });
            }else{
              init(workspaceData);
            }
          });
        }
      };
    }
  ]);

}(angular.module('presetsApp')));
