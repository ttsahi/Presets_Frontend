/**
 * Created by tzachit on 25/11/14.
 */

(function(app){

  'use strict';

  function Position(x, y) {
    this.x = x;
    this.y = y;
  }

  function Cursor(side, type) {
    this.side = side;
    this.type = type;
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

  function Panel(overlay, container, content) {
    this.id = null;
    this.position = null;
    this.overlay = overlay;
    this.container = container;
    this.content = content;
    this.tile = null;
    this.inUse = false;
    this.referTo = null;
    this.children = [];
    this.corners = null;
  }

  function PanelOverlay(element){
    this.id = 0;
    this.element = element;
    this.cover = null;
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
          tempPanel = new Panel(null, null, null);
          tempPanel.id = cornerPanel.id;
          tempPanel.position = cornerPanel.position;
          tempPanel.referTo = new Panel(null, null, null);
          tempPanel.referTo.corners = new Corners();
          tempPanel.referTo.corners.topLeft = cornerPanel;
          tempPanel.referTo.corners.topRight = topResult.topRightCorner;
          tempPanel.referTo.corners.bottomLeft = leftResult.bottomLeftCorner;
          tempPanel.referTo.corners.bottomRight = panel.corners ? panel.corners.bottomRight : panel;
          tempPanel.referTo.position = cornerPanel.position;
          tempPanel.referTo.id = cornerPanel.id;
          tempPanels.push(tempPanel);
        } else if (topResult) {
          options.inc = true;
          optionalPanels = optionalPanels.concat(topResult.topPanels);
          tempPanel = new Panel(null, null, null);
          tempPanel.id = topResult.topLeftCorner.id;
          tempPanel.position = topResult.topLeftCorner.position;
          tempPanel.referTo = new Panel(null, null, null);
          tempPanel.referTo.corners = new Corners();
          tempPanel.referTo.corners.topLeft = topResult.topLeftCorner;
          tempPanel.referTo.corners.topRight = topResult.topRightCorner;
          tempPanel.referTo.corners.bottomLeft = panel.corners ? panel.corners.bottomLeft : panel;
          tempPanel.referTo.corners.bottomRight = panel.corners ? panel.corners.bottomRight : panel;
          tempPanel.referTo.position = topResult.topLeftCorner.position;
          tempPanel.referTo.id = topResult.topLeftCorner.id;
          tempPanels.push(tempPanel);
        } else if (leftResult) {
          options.inc = true;
          optionalPanels = optionalPanels.concat(leftResult.leftPanels);
          tempPanel = new Panel(null, null, null);
          tempPanel.id = leftResult.topLeftCorner.id;
          tempPanel.position = leftResult.topLeftCorner.position;
          tempPanel.referTo = new Panel(null, null, null);
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
            tempPanel = new Panel(null, null, null);
            tempPanel.id = topResult.topLeftCorner.id;
            tempPanel.position = topResult.topLeftCorner.position;
            tempPanel.referTo = new Panel(null, null, null);
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
            tempPanel = new Panel(null, null, null);
            tempPanel.id = leftResult.topLeftCorner.id;
            tempPanel.position = leftResult.topLeftCorner.position;
            tempPanel.referTo = new Panel(null, null, null);
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
          tempPanel = new Panel(null, null, null);
          tempPanel.id = cornerPanel.id;
          tempPanel.position = cornerPanel.position;
          tempPanel.referTo = new Panel(null, null, null);
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
          tempPanel = new Panel(null, null, null);
          tempPanel.id = topResult.topRightCorner.id;
          tempPanel.position = topResult.topRightCorner.position;
          tempPanel.referTo = new Panel(null, null, null);
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
          tempPanel = new Panel(null, null, null);
          tempPanel.id = rightResult.topRightCorner.id;
          tempPanel.position = rightResult.topRightCorner.position;
          tempPanel.referTo = new Panel(null, null, null);
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
            tempPanel = new Panel(null, null, null);
            tempPanel.id = topResult.topRightCorner.id;
            tempPanel.position = topResult.topRightCorner.position;
            tempPanel.referTo = new Panel(null, null, null);
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
            tempPanel = new Panel(null, null, null);
            tempPanel.id = rightResult.topRightCorner.id;
            tempPanel.position = rightResult.topRightCorner.position;
            tempPanel.referTo = new Panel(null, null, null);
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
          tempPanel = new Panel(null, null, null);
          tempPanel.id = cornerPanel.id;
          tempPanel.position = cornerPanel.position;
          tempPanel.referTo = new Panel(null, null, null);
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
          tempPanel = new Panel(null, null, null);
          tempPanel.id = bottomResult.bottomLeftCorner.id;
          tempPanel.position = bottomResult.bottomLeftCorner.position;
          tempPanel.referTo = new Panel(null, null, null);
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
          tempPanel = new Panel(null, null, null);
          tempPanel.id = leftResult.bottomLeftCorner.id;
          tempPanel.position = leftResult.bottomLeftCorner.position;
          tempPanel.referTo = new Panel(null, null, null);
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
            tempPanel = new Panel(null, null, null);
            tempPanel.id = bottomResult.bottomLeftCorner.id;
            tempPanel.position = bottomResult.bottomLeftCorner.position;
            tempPanel.referTo = new Panel(null, null, null);
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
            tempPanel = new Panel(null, null, null);
            tempPanel.id = leftResult.bottomLeftCorner.id;
            tempPanel.position = leftResult.bottomLeftCorner.position;
            tempPanel.referTo = new Panel(null, null, null);
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
          tempPanel = new Panel(null, null, null);
          tempPanel.id = cornerPanel.id;
          tempPanel.position = cornerPanel.position;
          tempPanel.referTo = new Panel(null, null, null);
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
          tempPanel = new Panel(null, null, null);
          tempPanel.id = bottomResult.bottomRightCorner.id;
          tempPanel.position = bottomResult.bottomRightCorner.position;
          tempPanel.referTo = new Panel(null, null, null);
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
          tempPanel = new Panel(null, null, null);
          tempPanel.id = rightResult.bottomRightCorner.id;
          tempPanel.position = rightResult.bottomRightCorner.position;
          tempPanel.referTo = new Panel(null, null, null);
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
            tempPanel = new Panel(null, null, null);
            tempPanel.id = bottomResult.bottomRightCorner.id;
            tempPanel.position = bottomResult.bottomRightCorner.position;
            tempPanel.referTo = new Panel(null, null, null);
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
            tempPanel = new Panel(null, null, null);
            tempPanel.id = rightResult.bottomRightCorner.id;
            tempPanel.position = rightResult.bottomRightCorner.position;
            tempPanel.referTo = new Panel(null, null, null);
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
          tempPanel = new Panel(null, null, null);
          tempPanel.id = topResult.topLeftCorner.id;
          tempPanel.position = topResult.topLeftCorner.position;
          tempPanel.referTo = new Panel(null, null, null);
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
          tempPanel = new Panel(null, null, null);
          tempPanel.id = bottomResult.bottomLeftCorner.id;
          tempPanel.position = bottomResult.bottomLeftCorner.position;
          tempPanel.referTo = new Panel(null, null, null);
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
          tempPanel = new Panel(null, null, null);
          tempPanel.id = leftResult.topLeftCorner.id;
          tempPanel.position = leftResult.topLeftCorner.position;
          tempPanel.referTo = new Panel(null, null, null);
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
          tempPanel = new Panel(null, null, null);
          tempPanel.id = rightResult.topRightCorner.id;
          tempPanel.position = rightResult.topRightCorner.position;
          tempPanel.referTo = new Panel(null, null, null);
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

    var newPanel = new Panel(null, null, null);
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
      panelsOverlays[index].cover = angular.element('<div class="presets-optional"></div>');
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

  app.directive('workspace', ['$compile',
    function($compile) {

      return {
        restrict: 'EA',
        replace: true,
        require: '^presets',
        link: function (scope, element, attrs, controller) {

          var rows = 4; //Number(attrs.rows);
          var cols = 5; //Number(attrs.cols);

          var panels = [];

          var extendStart = false;
          var realPanel = null;
          var mousePosition = null;
          var originId = 0;
          var startWidth = 0;
          var startHeight = 0;
          var originalWidth = 0;
          var originalHeight = 0;
          var calculationData = null;
          var selectedCorner = null;
          var selectedSide = null;
          var container = null;
          var newPanel = null;
          var errorPanel = null;
          var errorContainer = null;
          var currentPanel = null;
          var optionalPanels = [];

          function changePanelSizeAndPosition(newPanel, originPanel){

            var i = 0;
            var realPanel = panels[newPanel.id];

            originPanel.overlay.css('z-index', '2');

            originPanel.container.width = 0;
            originPanel.container.height = 0;

            originPanel.container.element.css({
              width: '100%',
              height: '100%'
            });

            originPanel.corners = null;

            if(originPanel.children.length !== 0){
              while(originPanel.children.length !== 0){
                var child = originPanel.children.pop();
                child.inUse = false;
                child.referTo = null;
              }
            }

            if(realPanel.content !== originPanel.content){
              realPanel.container.element.append(originPanel.content);
              originPanel.container.element.append(realPanel.content);
              var tempContent = originPanel.content;
              originPanel.content = realPanel.content;
              realPanel.content = tempContent;
            }

            if(newPanel.corners !== null) {
              realPanel.corners = newPanel.corners;

              realPanel.children = newPanel.children;
              for (i = 0; i < realPanel.children.length; i++) {
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

            return realPanel;
          }

          function onMouseDown(event) {
            event.stopPropagation();
            event.preventDefault();

            extendStart = true;
            originId = event.data.id;
            realPanel = event.data.referTo ? event.data.referTo : event.data;
            container = realPanel.container;
            setMouseCursors(container.cursor.type, panels);

            mousePosition = new Position(event.pageX, event.pageY);

            startWidth = container.width;
            startHeight = container.height;

            originalWidth = event.data.overlay.width();
            originalHeight = event.data.overlay.height();

            calculationData = new SizeCalculationData();

            calculationData.originalContainerWidth = container.width;
            calculationData.originalContainerHeight = container.height;

            calculationData.backToOriginalWidth = false;
            calculationData.backToOriginalHeight = false;

            selectedSide = container.cursor.side;
            realPanel.overlay.css('z-index', '3');

            container.cover = angular.element('<div class="presets-selector"></div>');
            container.element.append(container.cover);

            var resizeOptions = getResizeOptions(selectedCorner, selectedSide, cols, rows, panels);

            optionalPanels = calculateOptionalPanels(resizeOptions.optionalPanels, resizeOptions.tempPanels, selectedSide, cols, rows, panels);
            fillOptionalPanels(optionalPanels, panelsOverlays);

            newPanel = event.data.referTo ? event.data.referTo : event.data;
            currentPanel = event.data;
          }

          function onMouseUp(event) {
            extendStart = false;

            if(errorPanel !== null){
              errorContainer.cover.remove();
              errorContainer.cover = null;
              errorContainer = null;
            }

            truncateOptionalPanels(optionalPanels, panelsOverlays);
            setMouseCursors('initial', panels);

            container.cover.remove();
            container.cover = null;

            container.element.css({
              top: '0%',
              left: '0%',
              width: (startWidth + 1) * 100 + '%',
              height: (startHeight + 1) * 100 + '%'
            });

            if(event.data !== panels[originId] && event.data !== errorPanel) {
              var p = changePanelSizeAndPosition(newPanel, realPanel);
              console.log('new panel');
              console.log(p);
            }

            errorPanel = null;
            mousePosition = null;
            calculationData = null;
          }

          function onMouseEnter(event) {
            event.stopPropagation();

            if (!extendStart) {

              selectedCorner = event.data;

            } else {

              if(errorPanel !== null){
                errorContainer.cover.remove();
                errorContainer.cover = null;
                errorPanel = null;
                errorContainer = null;
              }

              if(panels[originId] !== event.data && !checkIfLegalPanel(optionalPanels, event.data)){
                errorPanel = event.data;
                errorContainer = errorPanel.referTo ? errorPanel.referTo.container : errorPanel.container;
                errorContainer.cover = angular.element('<div class="presets-error"></div>');
                errorContainer.element.append(errorContainer.cover);
                console.log('error!!!');
                return;
              }

              newPanel = calculateNewPanel(newPanel, event.data, selectedSide, cols, panels);
            }
          }

          function onMouseMove(event) {
            event.stopPropagation();

            if (extendStart) {

              var deltaX = event.pageX - mousePosition.x;
              var deltaY = event.pageY - mousePosition.y;

              container = realPanel.container;

              calculateContainerSizeOnMove(container, selectedSide, deltaX, deltaY, originalWidth, originalHeight,
                mousePosition, calculationData);
            }else{

              var container = event.data.referTo ? event.data.referTo.container : event.data.container;
              var offset = container.element.offset();

              var clientX = event.pageX - (offset.left);
              var clientY = event.pageY - (offset.top);

              var hitArea = getHitArea(container.element.outerWidth(), container.element.outerHeight(), clientX, clientY);
              var cursorType = getCursorType(hitArea);

              event.data.overlay.css('cursor', cursorType);
              container.element.css('cursor', cursorType);
              container.cursor = new Cursor(hitArea, cursorType);
            }
          }

          function createPanel() {
            var overlay = angular.element('<div class="presets-panel"></div>');
            var container = angular.element('<div class="resize"></div>');
            var content = angular.element('<div class="content"><div style="height: 100%; overflow: auto; background-color: #dbdbdb"><h1></h1></div></div>');
            container.append(content);
            overlay.append(container);

            var panel = new Panel(overlay, new Container(container, 0, 0), content);

            overlay.mousedown(panel, onMouseDown);

            overlay.mouseup(panel, onMouseUp);

            overlay.mouseenter(panel, onMouseEnter);

            overlay.mousemove(panel, onMouseMove);

            content.mousedown(function(event){
              console.log("i'm a content!!!!!")
            });

            return panel;
          }

          function createPanelOverlay() {
            return new PanelOverlay(angular.element('<div class="panel-overlay"><div class="content"></div></div>'));
          }

          var presetsContainer = angular.element('<div class="presets-container"></div>');
          var presetsPanelsOverlay = angular.element('<div class="presets-panels-overlay"></div>');
          var presetsPanelsContainer = angular.element('<div class="presets-panels-container"></div>');

          presetsContainer.append(presetsPanelsOverlay);
          presetsContainer.append(presetsPanelsContainer);

          var panelId = 0;
          var panelsOverlays = [];

          for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++) {
              var panelOverlay = createPanelOverlay();
              presetsPanelsOverlay.append(panelOverlay.element);
              panelOverlay.id = panelId;
              panelsOverlays.push(panelOverlay);

              var panel = createPanel();
              presetsPanelsContainer.append(panel.overlay);
              panel.id = panelId;
              panel.position = new Position(j, i);
              panels.push(panel);

              panelId++;
            }
          }

          var calculateLocationsAndSizes = function () {

            var sizeWidth = 100 / cols;
            var sizeHeight = 100 / rows;

            var index = 0;

            for (var i = 0; i < rows; i++) {
              for (var j = 0; j < cols; j++) {

                var top = sizeHeight * i + '%';
                var left = sizeWidth * j + '%';

                var width = sizeWidth + '%';
                var height = sizeHeight + '%';

                panelsOverlays[index].element.css('top', top);
                panelsOverlays[index].element.css('left', left);

                panelsOverlays[index].element.css('width', width);
                panelsOverlays[index].element.css('height', height);

                panels[index].overlay.css('top', top);
                panels[index].overlay.css('left', left);

                panels[index].overlay.css('width', width);
                panels[index].overlay.css('height', height);

                index++;
              }
            }
          };

          element.append(presetsContainer);

          calculateLocationsAndSizes();
        }
      };
    }
  ]);

}(angular.module('presetsApp')));
